- [Java并发系列[5]----ReentrantLock源码分析](https://www.cnblogs.com/liuyun1995/p/8462088.html)
- [【97期】Java并发系列 | ReentrantLock源码分析](https://mp.weixin.qq.com/s/oliBtqZumG7zlWvkJsdILg)

在Java5.0之前，协调对共享对象的访问可以使用的机制只有`synchronized`和`volatile`。我们知道`synchronized`关键字实现了内置锁，而`volatile`关键字保证了多线程的内存可见性。

在大多数情况下，这些机制都能很好地完成工作，但却无法实现一些更高级的功能，例如，无法中断一个正在等待获取锁的线程，无法实现限定时间的获取锁机制，无法实现非阻塞结构的加锁规则等。

而这些更灵活的加锁机制通常都能够提供更好的活跃性或性能。因此，在Java5.0中增加了一种新的机制：`ReentrantLock`。

`ReentrantLock`类实现了`Lock`接口，并提供了与`synchronized`相同的互斥性和内存可见性，它的底层是通过`AQS`来实现多线程同步的。

与内置锁相比`ReentrantLock`不仅提供了更丰富的加锁机制，而且在性能上也不逊色于内置锁(在以前的版本中甚至优于内置锁)。

说了`ReentrantLock`这么多的优点，那么下面我们就来揭开它的源码看看它的具体实现。

## 1、synchronized关键字的介绍

Java提供了内置锁来支持多线程的同步，JVM根据`synchronized`关键字来标识同步代码块，当线程进入同步代码块时会自动获取锁，退出同步代码块时会自动释放锁，一个线程获得锁后其他线程将会被阻塞。

每个Java对象都可以用做一个实现同步的锁，`synchronized`关键字可以用来修饰对象方法，静态方法和代码块，当修饰对象方法和静态方法时锁分别是方法所在的对象和Class对象，当修饰代码块时需提供额外的对象作为锁。

每个Java对象之所以可以作为锁，是因为在对象头中关联了一个`monitor`对象(管程)，线程进入同步代码块时会自动持有`monitor`对象，退出时会自动释放`monitor`对象，当`monitor`对象被持有时其他线程将会被阻塞。

当然这些同步操作都由JVM底层帮你实现了，但以`synchronized`关键字修饰的方法和代码块在底层实现上还是有些区别的。

`synchronized`关键字修饰的方法是隐式同步的，即无需通过字节码指令来控制的，JVM可以根据方法表中的`ACC_SYNCHRONIZED`访问标志来区分一个方法是否是同步方法；

而`synchronized`关键字修饰的代码块是显式同步的，它是通过`monitorenter`和`monitorexit`字节码指令来控制线程对管程的持有和释放。

`monitor`对象内部持有_count字段，_count等于0表示管程未被持有，_count大于0表示管程已被持有，每次持有线程重入时_count都会加1，每次持有线程退出时_count都会减1，这就是内置锁重入性的实现原理。

另外，`monitor`对象内部还有两条队列`_EntryList`和`_WaitSet`，对应着`AQS`的同步队列和条件队列，当线程获取锁失败时会到`_EntryList`中阻塞，当调用锁对象的`wait`方法时线程将会进入`_WaitSet`中等待，这是内置锁的线程同步和条件等待的实现原理。

## 2、ReentrantLock和Synchronized的比较

`synchronized`关键字是Java提供的内置锁机制，其同步操作由底层JVM实现，而`ReentrantLock`是`java.util.concurrent`包提供的显式锁，其同步操作由`AQS`同步器提供支持。

`ReentrantLock`在加锁和内存上提供的语义与内置锁相同，此外它还提供了一些其他功能，包括定时的锁等待，可中断的锁等待，公平锁，以及实现非块结构的加锁。

另外，在早期的JDK版本中`ReentrantLock`在性能上还占有一定的优势，既然`ReentrantLock`拥有这么多优势，为什么还要使用`synchronized`关键字呢？

事实上确实有许多人使用`ReentrantLock`来替代`synchronized`关键字的加锁操作。但是内置锁仍然有它特有的优势，内置锁为许多开发人员所熟悉，使用方式也更加的简洁紧凑，因为显式锁必须手动在finally块中调用unlock，所以使用内置锁相对来说会更加安全些。

同时未来更加可能会去提升`synchronized`而不是`ReentrantLock`的性能。因为`synchronized`是JVM的内置属性，它能执行一些优化，例如对线程封闭的锁对象的锁消除优化，通过增加锁的粒度来消除内置锁的同步，而如果通过基于类库的锁来实现这些功能，则可能性不大。

所以当需要一些高级功能时才应该使用`ReentrantLock`，这些功能包括：可定时的，可轮询的与可中断的锁获取操作，公平队列，以及非块结构的锁。否则，还是应该优先使用`synchronized`。

## 3、获取锁和释放锁的操作

我们首先来看一下使用`ReentrantLock`加锁的示例代码。

```java
public void doSomething() {
    //默认是获取一个非公平锁
    ReentrantLock lock = new ReentrantLock();
    try{
        //执行前先加锁
        lock.lock();   
        //执行操作...
    }finally{
        //最后释放锁
        lock.unlock();
    }
}
```

以下是获取锁和释放锁这两个操作的API。

```java
//获取锁的操作
public void lock() {
    sync.lock();
}
//释放锁的操作
public void unlock() {
    sync.release(1);
}
```

可以看到获取锁和释放锁的操作分别委托给`Sync`对象的`lock`方法和`release`方法。

```java
public class ReentrantLock implements Lock, java.io.Serializable {

    private final Sync sync;

    abstract static class Sync extends AbstractQueuedSynchronizer {
        abstract void lock();
    }

    //实现非公平锁的同步器
    static final class NonfairSync extends Sync {
        final void lock() {
            ...
        }
    }

    //实现公平锁的同步器
    static final class FairSync extends Sync {
        final void lock() {
            ...
        }
    }
}
```

每个`ReentrantLock`对象都持有一个`Sync`类型的引用，这个`Sync`类是一个抽象内部类它继承自`AbstractQueuedSynchronizer`，它里面的`lock`方法是一个抽象方法。`ReentrantLock`的成员变量`sync`是在构造时赋值的，下面我们看看`ReentrantLock`的两个构造方法都做了些什么？

```java
//默认无参构造器
public ReentrantLock() {
    sync = new NonfairSync();
}

//有参构造器
public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

调用默认无参构造器会将`NonfairSync`实例赋值给`sync`，此时锁是非公平锁。有参构造器允许通过参数来指定是将`FairSync`实例还是`NonfairSync`实例赋值给`sync`。

`NonfairSync`和`FairSync`都是继承自`Sync`类并重写了`lock()`方法，所以公平锁和非公平锁在获取锁的方式上有些区别，这个我们下面会讲到。

再来看看释放锁的操作，每次调用`unlock()`方法都只是去执行`sync.release(1)`操作，这步操作会调用`AbstractQueuedSynchronizer`类的`release()`方法，我们再来回顾一下。

```java
//释放锁的操作(独占模式)
public final boolean release(int arg) {
    //拨动密码锁, 看看是否能够开锁
    if (tryRelease(arg)) {
        //获取head结点
        Node h = head;
        //如果head结点不为空并且等待状态不等于0就去唤醒后继结点
        if (h != null && h.waitStatus != 0) {
            //唤醒后继结点
            unparkSuccessor(h);
        }
        return true;
    }
    return false;
}
```
这个`release`方法是`AQS`提供的释放锁操作的API，它首先会去调用`tryRelease`方法去尝试获取锁，`tryRelease`方法是抽象方法，它的实现逻辑在子类`Sync`里面。

```java
//尝试释放锁
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;
    //如果持有锁的线程不是当前线程就抛出异常
    if (Thread.currentThread() != getExclusiveOwnerThread()) {
        throw new IllegalMonitorStateException();
    }
    boolean free = false;
    //如果同步状态为0则表明锁被释放
    if (c == 0) {
        //设置锁被释放的标志为真
        free = true;
        //设置占用线程为空
        setExclusiveOwnerThread(null);
    }
    setState(c);
    return free;
}
```

这个`tryRelease`方法首先会获取当前同步状态，并将当前同步状态减去传入的参数值得到新的同步状态，然后判断新的同步状态是否等于0，如果等于0则表明当前锁被释放，然后先将锁的释放状态置为真，再将当前占有锁的线程清空，最后调用`setState`方法设置新的同步状态并返回锁的释放状态。

## 4、公平锁和非公平锁

我们知道`ReentrantLock`是公平锁还是非公平锁是基于`sync`指向的是哪个具体实例。

在构造时会为成员变量`sync`赋值，如果赋值为`NonfairSync`实例则表明是非公平锁，如果赋值为`FairSync`实例则表明为公平锁。

如果是公平锁，线程将按照它们发出请求的顺序来获得锁，但在非公平锁上，则允许插队行为：当一个线程请求非公平的锁时，如果在发出请求的同时该锁的状态变为可用，那么这个线程将跳过队列中所有等待的线程直接获得这个锁。

下面我们先看看非公平锁的获取方式。

```java
//非公平同步器
static final class NonfairSync extends Sync {
    //实现父类的抽象获取锁的方法
    final void lock() {
        //使用CAS方式设置同步状态
        if (compareAndSetState(0, 1)) {
            //如果设置成功则表明锁没被占用
            setExclusiveOwnerThread(Thread.currentThread());
        } else {
            //否则表明锁已经被占用, 调用acquire让线程去同步队列排队获取
            acquire(1);
        }
    }
    //尝试获取锁的方法
    protected final boolean tryAcquire(int acquires) {
        return nonfairTryAcquire(acquires);
    }
}

//以不可中断模式获取锁(独占模式)
public final void acquire(int arg) {
    if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg)) {
        selfInterrupt();
    }
}
```

可以看到在非公平锁的`lock`方法中，线程第一步就会以`CAS`方式将同步状态的值从0改为1。其实这步操作就等于去尝试获取锁，如果更改成功则表明线程刚来就获取了锁，而不必再去同步队列里面排队了。

如果更改失败则表明线程刚来时锁还未被释放，所以接下来就调用acquire方法。

我们知道这个`acquire`方法是继承自`AbstractQueuedSynchronizer`的方法，现在再来回顾一下该方法，线程进入`acquire`方法后首先去调用`tryAcquire`方法尝试去获取锁，由于`NonfairSync`覆盖了`tryAcquire`方法，并在方法中调用了父类`Sync`的`nonfairTryAcquire`方法，所以这里会调用到`nonfairTryAcquire`方法去尝试获取锁。

我们看看这个方法具体做了些什么：

```java
//非公平的获取锁
final boolean nonfairTryAcquire(int acquires) {
    //获取当前线程
    final Thread current = Thread.currentThread();
    //获取当前同步状态
    int c = getState();
    //如果同步状态为0则表明锁没有被占用
    if (c == 0) {
        //使用CAS更新同步状态
        if (compareAndSetState(0, acquires)) {
            //设置目前占用锁的线程
            setExclusiveOwnerThread(current);
            return true;
        }
    //否则的话就判断持有锁的是否是当前线程
    }else if (current == getExclusiveOwnerThread()) {
        //如果锁是被当前线程持有的, 就直接修改当前同步状态
        int nextc = c + acquires;
        if (nextc < 0) {
            throw new Error("Maximum lock count exceeded");
        }
        setState(nextc);
        return true;
    }
    //如果持有锁的不是当前线程则返回失败标志
    return false;
}
```

`nonfairTryAcquire`方法是`Sync`的方法，我们可以看到线程进入此方法后首先去获取同步状态，如果同步状态为0就使用`CAS`操作更改同步状态，其实这又是获取了一遍锁。

如果同步状态不为0表明锁被占用，此时会先去判断持有锁的线程是否是当前线程，如果是的话就将同步状态加1，否则的话这次尝试获取锁的操作宣告失败。于是会调用`addWaiter`方法将线程添加到同步队列。

综上来看，在非公平锁的模式下一个线程在进入同步队列之前会尝试获取两遍锁，如果获取成功则不进入同步队列排队，否则才进入同步队列排队。

接下来我们看看公平锁的获取方式：

```java
//实现公平锁的同步器
static final class FairSync extends Sync {
    //实现父类的抽象获取锁的方法
    final void lock() {
        //调用acquire让线程去同步队列排队获取
        acquire(1);
    }
    //尝试获取锁的方法
    protected final boolean tryAcquire(int acquires) {
        //获取当前线程
        final Thread current = Thread.currentThread();
        //获取当前同步状态
        int c = getState();
        //如果同步状态0则表示锁没被占用
        if (c == 0) {
            //判断同步队列是否有前继结点
            if (!hasQueuedPredecessors() && compareAndSetState(0, acquires)) {
                //如果没有前继结点且设置同步状态成功就表示获取锁成功
                setExclusiveOwnerThread(current);
                return true;
            }
        //否则判断是否是当前线程持有锁
        }else if (current == getExclusiveOwnerThread()) {
            //如果是当前线程持有锁就直接修改同步状态
            int nextc = c + acquires;
            if (nextc < 0) {
                throw new Error("Maximum lock count exceeded");
            }
            setState(nextc);
            return true;
        }
        //如果不是当前线程持有锁则获取失败
        return false;
    }
}
```

调用公平锁的`lock`方法时会直接调用`acquire`方法。同样的，`acquire`方法首先会调用`FairSync`重写的`tryAcquire`方法来尝试获取锁。

在该方法中也是首先获取同步状态的值，如果同步状态为0则表明此时锁刚好被释放，这时和非公平锁不同的是它会先去调用`hasQueuedPredecessors`方法查询同步队列中是否有人在排队，如果没人在排队才会去修改同步状态的值，可以看到公平锁在这里采取礼让的方式而不是自己马上去获取锁。

除了这一步和非公平锁不一样之外，其他的操作都是一样的。综上所述，可以看到公平锁在进入同步队列之前只检查了一遍锁的状态，即使是发现了锁是开的也不会自己马上去获取，而是先让同步队列中的线程先获取，所以可以保证在公平锁下所有线程获取锁的顺序都是先来后到的，这也保证了获取锁的公平性。

那么我们为什么不希望所有锁都是公平的呢？

毕竟公平是一种好的行为，而不公平是一种不好的行为。由于线程的挂起和唤醒操作存在较大的开销而影响系统性能，特别是在竞争激烈的情况下公平锁将导致线程频繁的挂起和唤醒操作，而非公平锁可以减少这样的操作，所以在性能上将会优于公平锁。

另外，由于大部分线程使用锁的时间都是非常短暂的，而线程的唤醒操作会存在延时情况，有可能在A线程被唤醒期间B线程马上获取了锁并使用完释放了锁，这就导致了双赢的局面，A线程获取锁的时刻并没有推迟，但B线程提前使用了锁，并且吞吐量也获得了提高。

## 5、条件队列的实现机制

内置条件队列存在一些缺陷，每个内置锁都只能有一个相关联的条件队列，这导致多个线程可能在同一个条件队列上等待不同的条件谓词，那么每次调用`notifyAll`时都会将所有等待的线程唤醒，当线程醒来后发现并不是自己等待的条件谓词，转而又会被挂起。

这导致做了很多无用的线程唤醒和挂起操作，而这些操作将会大量浪费系统资源，降低系统的性能。

如果想编写一个带有多个条件谓词的并发对象，或者想获得除了条件队列可见性之外的更多控制权，就需要使用显式的`Lock`和`Condition`而不是内置锁和条件队列。

一个`Condition`和一个`Lock`关联在一起，就像一个条件队列和一个内置锁相关联一样。要创建一个`Condition`，可以在相关联的`Lock`上调用`Lock.newCondition`方法。我们先来看一个使用`Condition`的示例。

```java
public class BoundedBuffer {

    final Lock lock = new ReentrantLock();
    final Condition notFull = lock.newCondition();   //条件谓词：notFull
    final Condition notEmpty = lock.newCondition();  //条件谓词：notEmpty
    final Object[] items = new Object[100];
    int putptr, takeptr, count;

    //生产方法
    public void put(Object x) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length)
                notFull.await();  //队列已满, 线程在notFull队列上等待
            items[putptr] = x;
            if (++putptr == items.length) putptr = 0;
            ++count;
            notEmpty.signal(); //生产成功, 唤醒notEmpty队列的结点
        } finally {
            lock.unlock();
        }
    }

    //消费方法
    public Object take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0)
                notEmpty.await(); //队列为空, 线程在notEmpty队列上等待
            Object x = items[takeptr];
            if (++takeptr == items.length) takeptr = 0;
            --count;
            notFull.signal();  //消费成功, 唤醒notFull队列的结点
            return x;
        } finally {
            lock.unlock();
        }
    } 
}
```

一个`lock`对象可以产生多个条件队列，这里产生了两个条件队列`notFull`和`notEmpty`。当容器已满时再调用`put`方法的线程需要进行阻塞，等待条件谓词为真(容器不满)才醒来继续执行；

当容器为空时再调用`take`方法的线程也需要阻塞，等待条件谓词为真(容器不空)才醒来继续执行。

这两类线程是根据不同的条件谓词进行等待的，所以它们会进入两个不同的条件队列中阻塞，等到合适时机再通过调用`Condition`对象上的API进行唤醒。下面是`newCondition`方法的实现代码。

```java
//创建条件队列
public Condition newCondition() {
    return sync.newCondition();
}

abstract static class Sync extends AbstractQueuedSynchronizer {
    //新建Condition对象
    final ConditionObject newCondition() {
        return new ConditionObject();
    }
}
```

`ReentrantLock`上的条件队列的实现都是基于`AbstractQueuedSynchronizer`的，我们在调用`newCondition`方法时所获得的`Condition`对象就是`AQS`的内部类`ConditionObject`的实例。

所有对条件队列的操作都是通过调用`ConditionObject`对外提供的API来完成的。

至此，我们对`ReentrantLock`源码的剖析也告一段落，希望阅读本篇文章能够对读者们理解并掌握`ReentrantLock`起到一定的帮助作用。
