type Runner = () => void;

class ListNode {
    value: Runner;
    next: ListNode;

    constructor(value: Runner) {
        this.value = value;
        this.next = null!;
    }
}

class Queue {
    size: number = 0;
    head?: ListNode;
    tail?: ListNode;

    enqueue(value) {
        const node = new ListNode(value);

        if (this.head) {
            this.tail!.next = node;
            this.tail = node;
        } else {
            this.head = node;
            this.tail = node;
        }

        this.size++;
    }

    dequeue() {
        const current = this.head;
        if (!current) {
            return;
        }

        this.head = this.head!.next!;
        this.size--;

        return current.value;
    }

    clear() {
        this.head = undefined;
        this.tail = undefined;
        this.size = 0;
    }
}

export function pLimit(concurrency) {
    var activeCount = 0;
    var queue = new Queue();

    function next() {
        activeCount--;
        if (queue.size > 0) {
            const fn = queue.dequeue()!;

            fn();
        }
    }

    function run(fn, resolve, args) {
        activeCount++;

        fn(args).then(function (res) {
            resolve(res);
            next();
        });
    }

    function add(fn, resolve, args) {
        queue.enqueue(run.bind(null, fn, resolve, args));

        (function () {
            setTimeout(function () {
                if (activeCount < concurrency && queue.size > 0) {
                    const fn = queue.dequeue()!;

                    fn();
                }
            });
        })();
    }

    function wrap(fn, ...args) {
        return new Promise(function (resolve) {
            add(fn, resolve, args);
        });
    }

    return wrap;
}
