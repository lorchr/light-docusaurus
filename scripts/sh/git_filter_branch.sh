git filter-branch --commit-filter '
    if [ "$GIT_AUTHOR_NAME" = "xxx" ];
    then
            GIT_AUTHOR_NAME="xxx";
            GIT_AUTHOR_EMAIL="xxx@163.com";
            git commit-tree "$@";
    else
            git commit-tree "$@";
    fi' HEAD

# git push --force