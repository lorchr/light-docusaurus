- [GitHub Actions 手动触发方式进化史](https://p3terx.com/archives/github-actions-manual-trigger.html)

## 前言
GitHub Ac­tions 是 Mi­crosoft 收购 GitHub 后推荐的一款 `CI/​CD` 工具。早期可能是处于初级开发阶段，它的功能非常原生，甚至没有直接提供一个手动触发按钮。一般的触发方式为代码变动（`push` 、`pull_request`），发布文件（`release`）或者定时（`schedule`）等，这些属于自动触发方式。如果我们需要在 GitHub 仓库没有任何变动的情况下手动触发就需要使用一些奇技淫巧。经历了漫长的功能迭代，官方最终正式带来了手动触发按钮功能，这也宣告了一个瞎折腾时代的结束，一个崭新的折腾时代开始。

## Star
本博客早前的文章[《使用 GitHub Actions 云编译 OpenWrt》](https://p3terx.com/archives/build-openwrt-with-github-actions.html)中曾介绍过这种触发方式，点击仓库上的 Star 按钮即可触发 GitHub Ac­tions 的工作流程。这是最容易实现的方式，只要 work­flow 文件中存在如下字段：
```yaml
on:
  watch:
    types: started
```

为了避免被其他人点击 Star 导致的不必要的麻烦，还需要在 work­flow 文件中加上 `if: github.event.repository.owner.id == github.event.sender.id` 字段，这样只有仓库所有者，也就是你自己点 Star 才有效。

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    if: github.event.repository.owner.id == github.event.sender.id
```

**点击 Star** 触发方式的 work­flow 文件示例：
```yaml
name: Test

on:
  watch:
    types: started

jobs:
  build:
    runs-on: ubuntu-latest
    if: github.event.repository.owner.id == github.event.sender.id

    steps:
       - name: Checkout
         uses: actions/checkout@v2
# ...
```

虽然其他人点击不再会触发，但是在 Ac­tions 页面还是会出现一个记录，所以这种手动触发方式并不完美。对于比较大的项目仓库使用可能会因为 Star 太多导致产生很多无意义的 Ac­tions 记录从而影响正常查看 Ac­tions 记录，所以这种方式只适合私有仓库、公开的测试仓库或者不起眼的小项目仓库。

## Webhook
给 GitHub API 发送一个 `repository dispatch event`(仓库调度事件) 请求，当 API 接收到请求后就会触发相应的 work­flow 。Web­hook 方式灵活多变，可控性强，对于高阶用户来说是一个利器，甚至可以自己写一个触发脚本、网页或者浏览器插件来实现更高级的功能。

### 创建 token
首先需要创建 [Personal access token](https://github.com/settings/tokens)，权限为 `repo` 即可。如果你不知道怎么做，可以[查看官方文档中的相关介绍](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)。to­ken 会用在 web­hook 的请求标头中，用于身份验证。

### 编写 Workflow 文件
在 work­flow 文件中设置 `repository_dispatch` 触发事件，以便 GitHub Ac­tions 能接收这个触发事件，这是一个最简单的 Work­flow 文件示例：
```yaml
on: repository_dispatch

jobs:
  run:
    runs-on: ubuntu-latest

    steps:
    - name: Hello World
      run: |
        echo My name is P3TERX.
        echo Hello World!
```

### 发送请求
通过 web­hook 来触发 GitHub Ac­tions，以下是一个使用 cURL 发送请求的例子：
```shell
curl -X POST https://api.github.com/repos/:owner/:repo/dispatches \
    -H "Accept: application/vnd.github.everest-preview+json" \
    -H "Authorization: token ACTIONS_TRIGGER_TOKEN" \
    --data '{"event_type": "TRIGGER_KEYWORDS"}'
```

需要要替换的值：

- :owner - 用户名
- :repo - 需要触发的 Github Action 所在的仓库名称
- ACTIONS_TRIGGER_TOKEN - 带有 repo 权限的 Personal access token
- TRIGGER_KEYWORDS - 自定义 Webhook 事件名称，可以为任意值，Actions 列表中会显示此名称，更多信息请参见下文。

### 进阶使用
在 web­hook 请求中需要发送一个 `event_type` 属性的 json 有效负载，前面例子中的 `TRIGGER_KEYWORDS` 就是所发送的有效负载，官方将它称之为 “自定义 Web­hook 事件名称”，为了方便理解下文将它称之为 “触发关键词”。因为没有做任何限制设置，所以可以为任意值，这是最基础的使用方式。有时一个仓库可能不止一个 work­flow ，所以我们就可能需要对触发关键词进行限制，使用不同的关键词来触发不同的 work­flow 。

设置 `repository_dispatch` 下的 `types` 字段的值可以限制触发关键词，下面的例子将设置 `helloworld` 这个触发关键词，只有当请求中的关键词为 helloworld 才会触发。
```yaml
on:
  repository_dispatch:
    types: helloworld
```

还可以给每一个步骤设置运行条件，在运行条件中 `github.event.action` 等于触发关键词，通过判断给定的值是否与 `github.event.action` 相同来判断该步骤是否需要执行。比如下面例子中只有当触发关键词为 helloworld 时才会执行这个步骤。
```yaml
steps:
- name: Hello World
  if: github.event.action == 'helloworld'
  run: |
    echo My name is P3TERX.
    echo Hello World!
```

通过判断 `github.event.action` 是否包含给定的值来判断该步骤是否需要执行。比如下面例子中当关键词包含 `hello` 这个步骤就会执行。
```yaml
steps:
- name: Hello World
  if: contains(github.event.action, 'hello')
  run: |
    echo My name is P3TERX.
    echo Hello World!
```

触发关键词也可以是多个，比如像下面这个例子。当触发关键词为 `helloworld` 时，只有 `Hello World` 步骤会运行；当触发关键词为 `test` 时，只有 `TEST` 步骤会运行；当触发关键词为 `none` 时，虽然 Ac­tions 会触发，但没有步骤运行。而发送其他关键词并不会触发这个 work­flow 。
```yaml
name: Webhook Test

on:
  repository_dispatch:
    types: [helloworld, test, none]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Hello World
      if: contains(github.event.action, 'hello')
      run: |
        echo My name is P3TERX.
        echo Hello World!

    - name: TEST
      if: github.event.action == 'test'
      run: |
        echo test
```

甚至还可以在一个 work­flow 完成后调用另一个 work­flow ，只需要在 work­flow 结尾加入相应的请求指令即可。具体就不做赘述了，相信看到这里的小伙伴都应该已经了解该如何去做了。

## 手动触发按钮
在时隔多年后 `GitHub Ac­tions` 终于引入了一个手动触发的按钮，不过默认是不开启的，需要在 work­flow 文件中设置 `workflow_dispatch` 触发事件。一个最简单的例子：
```yaml
on:
  workflow_dispatch:
```

设置好触发事件后就能在相关 work­flow 的页面下看到 Run workflow 按钮.


更复杂一点还可以实现在手动触发时填写参数，控制不同的工作流程或者直接改写某个环境变量等操作。目前官方文档已经相当完善，所以博主就不赘述了，感兴趣的小伙伴可以去参考官方文档中的相关章节。

## 尾巴
从最初的只能选择 Star ，到后来深入了解研究了 web­hook 触发方式自己写脚本、网页去触发，GitHub Ac­tions 促使我学习了很多新的东西。如果当初 GitHub 直接给了一个触发按钮，也许就不会去折腾了，也少了很多乐趣。这是 GitHub Ac­tions 的进化史，也是我自己的进化史。

本博客已开设 [Telegram 频道](https://t.me/P3TERX_ZONE)，欢迎小伙伴们订阅关注。

## 参考资料
[Setting up Webhooks for Github Actions](http://www.btellez.com/posts/triggering-github-actions-with-webhooks.html)

[GitHub Actions Docs: External events: repository_dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#external-events-repository_dispatch)

[GitHub API Docs: Create a repository dispatch event](https://docs.github.com/en/rest/repos?apiVersion=2022-11-28#create-a-repository-dispatch-event)

[GitHub Actions: Manual triggers with workflow_dispatch](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/)