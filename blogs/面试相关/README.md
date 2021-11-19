---
title: 深入理解 JavaScript 原型
date: 2020-12-01
tags:
 - JavaScript
categories:
 -  面试相关
---

**前言**

Prototype 是 JavaScript 里的一个基础概念，原本应该很容易理解。然而，出于各种原因，大部分前端开发者（包括我），在刚开始学习 JS 时，原型和原型链都是一个需要克服的困难。

不知道你是否也曾经被下面这种连线图，绕晕过：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f43031411b14240b2d6e34cda57a4db~tplv-k3u1fbpfcp-watermark.awebp)

其实看不懂上图也没关系，请不必自责，这不是你跟我的问题。尽管上图并没有画错。

只能说，在我理解 JS 原型之后，我对 JS 原型的想象图景（心智模型），跟图中的并不一样。我可以用我掌握的知识，检验它有没有画错。但若说它能促进我对 JS 原型的理解，却也谈不上。

JS 原型其实是一个具有复杂背景的简单事物。

大部分讲 JS 原型的文章，总体来说，内容都太简单了，形式上却搞得很复杂（各种连线）。对它的复杂背景也缺乏叙述。以至于对于读者来说，JS 原型仿佛是一个凭空出现的，需要强行理解的概念。

这篇文章想做另一个尝试，揭露 JS 原型背后的复杂背景，以及它自身的简单性。让大家可以在一个更宏观的角度，审视 JS 原型。希望能帮助到部分读者。

**1、ES2019 规范里描述的 Prototype**

[ES2019](https://link.juejin.cn?target=https%3A%2F%2Flink.zhihu.com%2F%3Ftarget%3Dhttps%3A%2F%2Fwww.ecma-international.org%2Fecma-262%2F10.0) 是当前最新的语言规范，可以作为我们理解 JS 原型的权威素材来源。

我们先从规范开始，看看里面如何介绍 Prototype。

**1.1、prototype 的定义**

> 4.3.5 prototype
>  object that provides shared properties for other objects

在规范里，prototype 被定义为：给其它对象提供共享属性的对象。

也就是说，prototype 自己也是对象，只是被用以承担某个职能罢了。

给定所有对象，我们当然可以为不同对象分配不同职能，然后给予不同称谓。

prototype 只是其中一种划分，我们也可以根据自己的需要，做出自己的划分和命名。

比如实现 pubsub pattern 订阅 / 发布模式时，我们将某个对象称之为 subscriber 订阅者，另一个对象称之为 publisher 发布者。

并非因为 subscriber 对象有跟其它对象有什么本质的不同，只是一个约定。

同理，当某个对象，承担了为其它对象提供共享属性的职责时，它就成了该对象的 prototype。当它失去这个职能（比如子对象的原型被设置为其它对象），它就不叫该对象的 prototype。

换句话说，当我们说 prototype 对象时，是在做一个简略描述，实际上说的是 “xxx 对象的 prototype 对象”。如果不跟其它对象产生关联，就不构成 prototype 这个称谓。

因此，prototype 描述的是两个对象之间的某种关系（其中一个，为另一个提供属性访问权限）。它是类似 father 父亲一样的称谓，而不是具有超能力的异常对象。

所有对象，都可以作为另一个对象的 prototype 来用。

那么，一个对象，具体如何为另一个对象提供属性访问呢？

**1.1.1、所有 object 对象都有一个隐式引用**

> Every object has an implicit reference (called the object's prototype)

规范中明确描述了所有对象，都有一个隐式引用，它被称之为这个对象的 prototype 原型。

什么叫隐式引用？

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc3ff6a6a71c40b5bd4b443fc7a5dd0c~tplv-k3u1fbpfcp-watermark.awebp)

如上图所示，在我们编写的代码里，只声明了 obj 对象的 a 和 b 两个属性。

在控制台却可以发现它有 **proto** 属性，这意味着 obj 被隐式地挂载了另一个对象的引用，置于 **proto** 属性中。

也就是说，所谓的隐式，是指不是由开发者 (你和我) 亲自创建 / 操作。

**1.1.2、历史问题：\**proto\****

前面我的措辞是 “隐式地挂载引用”，这跟规范里描述的 “隐式引用”，有一定的差别。

它们是两个维度。

一个是在操作层面上的隐式：是否偷偷做了挂载属性的动作。

一个是在关系层面上的隐式：这个属性能不能被直接访问。

**proto** 的例子，说起来比较复杂，可以说是一个历史问题。

ECMAScript 规范描述 prototype 是一个隐式引用，但之前的一些浏览器，已经私自实现了 **proto** 这个属性，使得可以通过 obj.**proto** 这个显式的属性访问，访问到被定义为隐式属性的 prototype。

其中的关系类似于，A 跟 B 说了一个秘密，要求 B 保密，但 B 大嘴巴，四处散播 A 的秘密。最后 A 的秘密，在事实上已经不是一个秘密了。到底 A 的秘密，还能不能叫秘密？

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d6d478157604e7c96c4dfbfd91696fe~tplv-k3u1fbpfcp-watermark.awebp)

因此，情况是这样的，ECMAScript 规范说 prototype 应当是一个隐式引用:

1）通过 Object.getPrototypeOf(obj) 间接访问指定对象的 prototype 对象。

2）通过 Object.setPrototypeOf(obj, anotherObj) 间接设置指定对象的 prototype 对象。

3）部分浏览器提前开了 **proto** 的口子，使得可以通过 obj.**proto** 直接访问原型，通过 obj.**proto** = anotherObj 直接设置原型。

4）ECMAScript 2015 规范只好向事实低头，将 **proto** 属性纳入了规范的一部分。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/286c5f126bff48a987fc621369985508~tplv-k3u1fbpfcp-watermark.awebp)

在 Object.prototype 上有 **proto** 属性，它是一个 accessor property，在 get 方法里调用 getPrototypeOf，在 set 方法里调用 setPrototypeOf。如此，可以让之前浏览器的不规范做法，作为规范的特殊场景。

像这种访问器属性，如果我们愿意，也随时可以实现出来：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3154c6ea01f24e1db326312bd70d48b9~tplv-k3u1fbpfcp-watermark.awebp)

如上，我们也基于 getter/setter 和 getPrototyoeOf/setPrototyoeOf，封装了一个指向对象 prototype 的属性。为了表明这种做法的任意性，我随意选择了 a 作为属性名。

此外，规范里还表明了另一个事实：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5338118c88114d448f0f971f1d9ab520~tplv-k3u1fbpfcp-watermark.awebp)

表面上看，上图的对象里存在一个 **proto** 属性。实际上，它只是开发者工具为了方便让开发者查看原型，故意渲染出来的虚拟节点。虽然跟对象的其它属性并列，但并不在该对象中。

**proto** 属性既不能被 for in 遍历出来，也不能被 Object.keys(obj) 查找出来。

访问对象的 obj.**proto** 属性，默认走的是 Object.prototype 对象上 **proto** 属性的 get/set 方法。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0d3c4d8603c42bd9ab7b423439258ec~tplv-k3u1fbpfcp-watermark.awebp)

通过覆盖 Object.prototype.**proto** 我们可以看到，访问普通对象的 **proto** 触发了 Object.prototype 上的 **proto** 的 get 方法。

因此，普通对象创建时，只需要将它内部的隐式引用指向 Object.prototype 对象，就能兼容 **proto** 属性访问行为，不需要将原型隐式挂载到对象的 **proto** 属性。

**1.1.3、prototype chain 原型链**

> a prototype may have a non-null implicit reference to its prototype, and so on; this is called the *prototype chain*.

如上，在 ECMAScript 2019 规范里，只通过短短的一句话，就介绍完了 prototype chain。

原型链的概念，仅仅是在原型这个概念基础上所作的直接推论。

既然 prototype 只是恰好作为另一个对象的隐式引用的普通对象。那么，它也是对象，也符合一个对象的基本特征。

也就是说，prototype 对象也有自己的隐式引用，有自己的 prototype 对象。

如此，构成了对象的原型的原型的原型的链条，直到某个对象的隐式引用为 null，整个链条终止。

**1.1.4、属性查找路径**

我们做一个 role playing 角色扮演，假设 JS 是我们的产品。

我们的产品经理给了 PRD，描述了需求是：prototype 原型的职能，是为其它对象提供共享的属性访问。

我们的架构师设计了一个方案：所有对象创建时，包含一个隐式引用，它就是该对象的原型。

需求跟方案不是代码，它们跑不起来。

需要我们的工程师将方案翻译成代码，落地。

他们实现了一个属性访问的查找路径算法：

1）将 current 设置为 obj

2）检查 current 自身是否包含 name 属性，如果包含，则返回该值

3）将 current 设置为 obj 的隐式引用（即 prototype 对象）

4）若 current 为 null，返回 undefined

5） 否则回到步骤 2

JS 代码模拟如下：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d809908a9c8485ca04401d312936396~tplv-k3u1fbpfcp-watermark.awebp)

通过这个查找属性算法，我们只需要将同个对象，设置为多个其它对象的原型，就能实现共享属性的功能了。

每次都要求开发者手动调用 lookupProperty 函数去访问自身属性 + 共享属性，显然是不现实的。

我们的产品经理要求优化用户体验，不要让用户亲自调用，在后台默默服务好就可以了。

我们的架构师根据新的需求提出方案：修改 obj.name 和 obj[name] 这个语句的行为，将 obj 和 name 作为参数传入 lookupProperty(obj, name)。

如此，用户以为自己在访问对象的属性，其实它是在整条原型链上查找。只是大部分情况下，恰好原型链上的第一个对象就包含该属性罢了。

用户以为自己在操作一个对象，哈哈。其实他们在操作由隐式引用关联起来的多个对象。

**1.2、对象的创建和关联原型**

许多介绍 JS 原型的文章，都从 constructor 构造函数和 prototype 入手。本文并没有这样做。

因为 prototype 的概念，跟对象的构造方式和原型关联方式，其实是两个问题。

JavaScript 只是其中一个 prototype-based inheritance 的语言，其它同样包含 prototype 概念的语言，并不像 JS 那样通过 constructor 和 prototype 构造对象和关联其原型。

因此，当我们谈论 prototype 时，它可以跟 constructor 和 constructor.prototype 无关。

**1.2.1、两类原型继承方式**

所谓的原型继承，就是指设置某个对象为另一个对象的原型（塞进该对象的隐式引用位置）。

在 JavaScript 中，有两类原型继承的方式：显式继承和隐式继承。

**1.2.1.1、显式原型继承**

在前文我们曾描述过显式跟隐式的差别：是否由开发者亲自操作。

所谓的显式原型继承，就是指我们亲自将某个对象设置为另一个对象的原型。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/afcf5428eac843adacdc5793634d3427~tplv-k3u1fbpfcp-watermark.awebp)

如上，通过调用 Object.setPrototypeOf 方法，我们将 obj_a 设置为 obj_b 的原型。访问 obj_b.a 时，lookupProperty 过程，先检查 obj_b 是否有 a 属性，没有就检查其原型 obj_a，可以找到 obj_a.a，最后返回 1。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17f3eedf60104b49adc8eececabe2eea~tplv-k3u1fbpfcp-watermark.awebp)

除了 Object.setPrototypeOf 方法以外，还有另一种途径。即是通过 Object.create 方法，直接继承另一个对象。

Object.setPropertyOf 和 Object.create 的差别在于：

1）Object.setPropertyOf，给我两个对象，我把其中一个设置为另一个的原型。

2）Object.create，给我一个对象，它将作为我创建的新对象的原型。

当我们已经拥有两个对象时，要构建原型关联，可以通过 Object.setPrototypeOf 来处理。

当我们只有一个对象，想以它为原型，创建新对象，则通过 Object.create 来处理。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4043faf88c4e42808bafbc109c525422~tplv-k3u1fbpfcp-watermark.awebp)

如上图所示，我们先创建好 6 个对象 a, b, c, d, e 和 f，然后用 Object.setPrototypeOf 将它们依次关联起来，最后用 Object.create 基于 f 创建新对象。

从控制台可以看到，第一层是一个空对象，第二层则是 f，f 的原型是 e，e 的原型是 d，依次类推，最后兜底的原型是 Object.prototype。

**1.2.1.2 隐式原型继承**

JavaScript 提供了隐式的原型继承方式，在讨论它之前，我们先把事情描述的更细致一些。

想要得到一个包含了数据、方法以及关联原型三个组成部分的丰满对象，一个相对具体的步骤如下：

1）创建空对象

2）设置该空对象的原型为另一个对象或者 null

3）填充该对象，增加属性或方法。

假设没有隐式原型继承，创建一个普通的 js 对象，要向下面这样：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f4dfbecf8b84a65b17f3bfa39d5ee1e~tplv-k3u1fbpfcp-watermark.awebp)

看起来比较繁琐。

产品经理又发话了，要让用户无感知的完成创建对象、原型继承和属性初始化的过程。

架构师想了一下，设计了一个方案：

1）我们将某些函数称之为 constructor，专门用来做属性初始化。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c1948388bce244359eaea320e9ec592a~tplv-k3u1fbpfcp-watermark.awebp)

2）我们约定，constructor 函数，有一个特殊属性 prototype

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35917594e3c24ba091c639edd8865f99~tplv-k3u1fbpfcp-watermark.awebp)

3）让用户使用 new 关键字，去创建新对象

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8736e50e00fd4c25a0c0a780ba44312f~tplv-k3u1fbpfcp-watermark.awebp)

4）在内部，我们偷偷做创建对象，关联原型和属性初始化等一系列过程。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b8cce105cd8c469f80e51f8c53b4ef87~tplv-k3u1fbpfcp-watermark.awebp)

用户能拿到跟自己手动创建一样的结果，但从 3 件事情，减少到了 2 件。他们不用亲自创建空对象了。

产品经理又表示，用户最好只做一件事情，这样就完美了。

架构师说，好吧，我让所有函数，都有 prototype 属性，它默认是以 Object.prototype 为原型的对象。

这样用户通常只需要编写 constructor 函数，描述如何初始化对象的属性即可。除非他们需要新增方法，否则都不必操作 constructor 的 prototype 对象。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5baca59a48b34a38b49f7c9abe7a9b59~tplv-k3u1fbpfcp-watermark.awebp)

如上，普通函数创建时，自带了 prototype 属性，该属性是一个对象，包含 constructor 一个字段，指向构造函数。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/220b9961d3ed440c8b2caf0ccee9e5b9~tplv-k3u1fbpfcp-watermark.awebp)

我们的 User 定义，简化为一个 User 函数，通过 new 去创建 user 对象，可以通过 user.consturctor 访问到它的构造函数。

**1.2.2 内置的构造函数和语法糖**

JavaScript 的主流继承方式，选择了隐式原型继承，它提供了几个内置的 constructor 函数，如 Object, Array, Boolean, String, Number 等。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff99cf4f0e264ddaa8a483731d881e5d~tplv-k3u1fbpfcp-watermark.awebp)

向上面那样创建一个新对象时，按照隐式原型继承的规则，它先创建一个空对象，然后将 Object.prototype 对象设置为该空对象的原型，然后执行 Object 函数里的属性初始化。

恰好，Object 函数没有增加任何属性，因此 user 是一个空对象，我们后续手动添加了 firstname 和 lastname 属性。

按照之前一贯的思路，这种繁琐的方式，将被一个语法糖化简掉。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31f5d6c0a4744d928bc0a1f40d787bc7~tplv-k3u1fbpfcp-watermark.awebp)

如上，这种写法叫对象字面量。它等价于前面 new Object 再挂载属性的过程。

并非所有语言都做这种等价转换，也就是说，对象字面量代表的行为，是可以不同的。

完全可以让上面的 user，真的只包含 firstname 和 lastname 而跟 Object.prototype 无关。

完全可以让 {} 空花括号，作为一个真正的空对象看待。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c536c971c7224a6fb15a36433e7f5cbe~tplv-k3u1fbpfcp-watermark.awebp)

同理，数组字面量，就是 new Array() 后再填充数据的语法糖。

JS 原型背景的复杂性，在此可见一斑。

当我们使用对象字面量创建一个新对象时，它有两层隐式行为。

1）隐式的通过 new Object() 去创建对象

2）隐式的进行原型继承

一个简单的语句，也包含了许多复杂的过程。

不仅如此，在名称的选择上，也没有特意去规避误解。

constructor 是一个函数，而所有函数都是 new Function 创建出来的，函数字面量可以看作是它的语法糖。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a19880d6d524386b0407980fd030c72~tplv-k3u1fbpfcp-watermark.awebp)

Function 在 ECMAScript 规范里，被定义为对象的一种。

也就是说，函数也是对象，也有自己的隐式引用（原型）。但函数的 prototype 属性，却不是该函数对象的原型。

而是基于前面介绍的隐式原型继承规则，作为原型，挂载到 new F() 创建出来的新对象内部。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87d94e05df434f31bf76bb2aa245c929~tplv-k3u1fbpfcp-watermark.awebp)

我想任何刚接触的，心智正常的开发者，在控制台看到函数的 prototype 和 **proto** 两个属性，都会感到困惑吧。

可以说，JS 原型之所以难以理解，主要原因是设计上的问题，而非技术难度。

如果将 constructor 函数的 prototype 改名为 properties。问题可能少很多。或者进一步简写成 props，理解上将更加简单。不就是 new Constructor 时，自带了它的 Constructor.props 对象嘛。

**2、隐式原型继承和显式原型继承的互操作性**

不管是隐式原型继承，还是显式原型继承，只是外在形态，核心是具备设置对象的隐式引用的功能。它们之间具备一定互操作性，也就是说，拥有其中一个，可以实现另一个的部分行为。

**2.1、从隐式原型继承中剥离出 Object.create 方法**

如前所述，隐式原型继承，是将 create, linking, initilize 等多个步骤耦合到一起。我们可以做一些解耦动作。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9762e01a51964f859fb98250ad49774d~tplv-k3u1fbpfcp-watermark.awebp)

如上，我们实现了一个简单的 Object.create 方法，它可以根据给定对象，创建以该对象为原型的新对象（Object.create 有第二个参数，按下不表）。

做法很简单，将 constructor 设置成空函数，相当于没有了属性初始化的过程，只剩下创建和关联原型两个动作。

有趣的是，在 ES5 之前，JS 里只有隐式原型继承。大家都是利用类似上面的解耦做法，去得到一个可以显式原型继承的函数。

**2.2、用显式原型继承的方式完成 constructor 初始化过程**

显式原型继承，是指使用 Object.setPrototypeOf 或 Object.create 方法，手动设置原型。它比隐式原型继承，更细粒度。

我们可以通过更细粒度的特性，去实现 new 语句所做的内容。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69c7545613df40dfb70dc0f5336b40bb~tplv-k3u1fbpfcp-watermark.awebp)

如上，实现一个 createInstance 创建实例对象的普通函数，它接受一个 Constructor 构造函数参数，和 args 参数。

按照隐式原型继承中描述的步骤，先将 Constructor.prototype 作为原型，创建一个空对象，然后通过 Constructor.call 将构造函数内部的 this 指向 instance 变量，将 args 传入。在构造函数内部完成属性初始化的过程。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/23e77147773d44bf819c085ce6efcde1~tplv-k3u1fbpfcp-watermark.awebp)

使用 createInstance 创建 user 对象，跟 new User 得到的结果一样。

通过了解两类原型继承方式之间的互操作性，我们可以更好的理解它们的内在关联。

**3、Prototype-based inheritance VS Class-based inheritance**

关于 prototype 原型的另一个复杂背景是，基于原型的继承和基于类的继承之间的差别和争议，已经持续了很多年。

**3.1、从朴素的演化角度理解 class 的产生过程**

我们可以尝试抛开 object-oriented programming 里的一些带有浓厚哲学色彩的说辞。从朴素的演化角度，去理解 class 的产生过程。

首先，编程语言提供了一些变量声明、赋值、控制语句、基本数据类型，以及函数和循环等的复用代码的途径。通过这些特性，我们按照命令式的风格，编写我们的代码。

很快我们发现，其实很多数据有它们内在的关联性，比如描述矩形的宽和高。但在代码上，它们是离散的变量，并不能体现这种关联。

然后我们开始用 struct 声明一个结构体，将多个关联的数据写到一起。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/afb873875ecb479aac9ce793259a40df~tplv-k3u1fbpfcp-watermark.awebp)

如上，我们将表征一个球的圆心位置和半径，写到了一起。

紧接着，在使用 struct + function 进行编程的过程中，我们又发现：其实很多 struct 结构体，都对应着某些函数。

比如我们可以为上面的 sphere 实现求圆的面积，周长等的函数。

也就是说，不仅数据之间有关联关系，数据和行为之间也有关联关系。

我们是否可以将 data 数据和 behavior 行为在代码上也关联起来？

好像并没有什么困难。我们可以将包含 data 数据和 behavior 行为的存在，称之为 object 对象。

为了方便多次创建同一类对象，我们可以设计一个对象生成模板，将对象内部的 data 属性，和 behavior 写到一起。

所有具体的对象，都由这个对象模板 + 参数产生出来。

可以称这个对象模板为一个 class，而由该模板产生的对象，则称之为该 class 的 instance 实例。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8b8f6d4aef124903909ef443202619be~tplv-k3u1fbpfcp-watermark.awebp)

数据和行为，是一个横向的关联。我们很快发现，不同的 class 之间，存在着纵向的关联关系。

比如 Dog class 和 Cat class 里都单独实现了在 Animal class 里已经实现过的方法 / 行为。

我们需要设计一种复用 class 这种模板的方式。在实践中，我们观察到，这种复用性，通常发生在类型范围缩小的场景。

越是抽象和宽泛的 class 类型，它里面的方法，越有可能被其子类型所复用。

那么，可以称这种垂直关联过程为 inherit 继承。

class 这种对象创建模板和垂直关联的事物，其能力的上限是否真如 OO 布道者所说的那样强大，可以建模整个世界，我们不太能确信。

通过上面的朴素角度，我们起码可以了解它的能力下限。在数据和行为之间，存在横向和纵向的关联时，class 能发挥一定的作用。

**3.2、从 class 角度理解 prototype**

class 的职责是充当创建 object 的模板， 通常来说，data 数据是由 instance 承载，而 methods 行为 / 方法则在 class 里。

也就是说，基于 class 的继承，继承的是行为和结构，但没有继承数据。

而基于 prototype 的继承，可以继承数据、结构和行为三者。

这是因为，prototype 无非是另一个对象，它跟其它对象一样，拥有自己的非函数属性（数据）和函数属性（方法）。

作为对象的 prototype，不仅可以被继承，还能被当作值传递，它跟其它普通对象，并没有不同。

class-based 和 prototype-based 的差异可以概括如下：

1. class -> class 之间存在继承关系，object 基于某个已完成继承关系的 class 模板所创建。

2）object -> object 之间存在继承关系，object 可以由各种方式创建。可以在创建时设置继承对象，也可以在创建后修改继承对象。

基于上述差异，有些开发者认为 prototype-based 的模式，比 class-based 的模式，更加面向对象。他们表示：难以想象还有比直接继承另一个已存在的对象，更加面向对象了。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/874ec7a4d5fd4162a78838218ba60289~tplv-k3u1fbpfcp-watermark.awebp)

在 JS 里的，class 是用 prototype 所模拟的，为了迎合 class 的基本行为。prototype 继承数据的能力被屏蔽了。

如上图所示，不管我们通过 class fields 语法，还是在 constructor 里面声明数据。最后，它们都将出现在实例对象上，而非原型对象上。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a4d537bbca6446f8166ad1977fabc65~tplv-k3u1fbpfcp-watermark.awebp)

只有 methods 方法的部分，出现在该 class 对应的原型上。

如果我们想得到 prototype-based 继承数据的能力，需要自己手动操作 constructor 的 prototype 对象，挂载数据上去。不过此时，它已经超出了 class 的默认行为，进入原型继承的领域。

**3.3、揭开语法糖包裹的实质**

正如我在《[100 行代码实现 Promises/A+ 规范](https://link.juejin.cn?target=https%3A%2F%2Fzhuanlan.zhihu.com%2Fp%2F83965949)》中描述的那样，语法糖不一定提供了更强的表达能力，往往相反。语法糖主要是为了开发者的便利性而设计。

最灵活的 prototype-based，是跟 constructor 和 class 都无关的，纯粹基于 object 对象的显式原型继承。

我们只需要创建对象，指定它的关联原型即可。

当我们想要通过模板化的语法糖，如 constructor + prototype 属性模式，或者 class 模式，我们首先因为耦合了对象创建、对象关联、对象属性初始化等过程，而变得更呆板，失去一些精细的控制空间。

当然，迎来的是代码在表面上的简洁性和可读性的提升。

为什么说是表面上？

因为，不管是 constructor 还是 class ，它们仅是让创建特定对象这个过程模板化了，但对象之间是需要组合和交互的。只优化了创建的部分，没有考虑后续的对象交互和组合，甚至产生反效果的话，总体上看，就只剩创建部分得到提高，而其它部分得到贬损，未必利大于弊。

面向对象领域诸多语焉不详的设计模式，就是在描述 class 和 object 的交互和组合。可以作为上述案例。

在《JavaScript 高级程序设计》一书里，描述了所谓的寄生、组合、借用以及寄生组合式继承等名词。相信许多看过这本书的前端工程师，都曾经反复查阅和思考，试图从中领略到原型和继承的真谛。

可惜的是，那些名词和概念，没有太多价值，也不曾成为前端开发里的主流术语。更多的是，把一个简单的东西复杂化。在一个错误的设计里，将错就错。

它们无非是在试图组合两个 constructor 及其 prototype，协调它们在属性初始化和原型继承上的关系。因为 constructor 模式，耦合了多个过程在内，导致开发者需要通过一些技巧，去屏蔽自己不想要的行为。

如果不用隐式原型继承，而改用显式继承的方式。很容易发觉，里面并没有什么技术含量，是一个简单的算法。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01dc1f4c120043ba9c8598649997ae9f~tplv-k3u1fbpfcp-watermark.awebp)

如上，我们实现了一个简单的 inherit 函数。

通过构造一个新的 constructor 函数，将 SuperConstructor 和 properties 里的 constructor 里的属性初始化行为合并到一起。

通过 Object.setPrototypeOf 将 Super 和 Sub 的原型关联起来。

使用方式类似于 class 语法，如下所示：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2c51f4f1f7354b989735e64336e635df~tplv-k3u1fbpfcp-watermark.awebp)

继承 Object 实现 Human，继承 Human 实现 User，实例化 user，查看原型链，第一层是 user 实例自身的数据，第二层是 User.prototype(拥有 showName 方法)，第三层是 Human.prototype（拥有 showAge 方法），第四层是 Object.prototype。Object.prototype 的原型是 null，因此没有第五层。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12e12e6c00e544358afcc71fb55925a0~tplv-k3u1fbpfcp-watermark.awebp)

如上，不需要 constructor 的辅助，我们直接声明对象字面量，手动设置原型，也能得到一样的结果。

当我们抛开 class, instance, inherit, constructor 等附加概念时，我们回归到最朴素的对象身上，我们关注的是真正起作用的部分。

1）对象如何创建，由谁创建？

2）对象如何跟其它对象或者方法，关联起来，由谁关联起来？

3）对象的属性 / 数据如何初始化 / 填充，由谁填充？

抓住上述要点，有助于理解不同语法糖包裹下的面向对象风格。

**4、从数据结构和算法的角度理解 prototype 和 class**

我们不仅需要洞察语法糖背后的实质行为，还需要洞察概念和术语背后对应的实质结构。

如果我们只掌握了对方给定的词汇，去描述某些概念。那么，一旦这些词汇过分宽泛，带有浓重的哲学色彩，或者神秘化，开发者不敢质疑，唯恐暴露自己的无知。如此，在这个领域无法形成真正的有效讨论，最终陷入意识形态上的争论中。

如果我们相信程序是简单的、可解释的，无非是数据结构 + 算法。那么，所有编程范式，语言风格，最终都将落实到具体的数据结构和算法上。

我们先问，JS Prototype 原型对应的数据结构和算法是什么？

JS 原型其实是一个隐式的单向链表。

Singley Linked Lists 是常见的数据结构之一，它的显著特征就是每个 item/node 中存储了指向下一个 item/node 的引用，通常是 next。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c85c8ba23a714657a977f046cfad487a~tplv-k3u1fbpfcp-watermark.awebp)

很容易发现，prototype 除了不叫 next，以及是一个隐式引用外，跟上述单向链表结构如出一辙。

在某些场景下，我们甚至可以直接把 Prototype 当作 JS 里内置的单向链表来用，而不必手动实现。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06dfbc6bb1244ab680d713a1aa7df6c2~tplv-k3u1fbpfcp-watermark.awebp)

首先，我们使用之前介绍过的访问器属性，像定义 **proto** 一样，定义 next。这样显得更加像链表，尽管 obj.**proto** 和 obj.next 访问的是同一个对象，但 next 无疑更符合链表的语义。并且，我们屏蔽了通过 next 访问到 Object.prototype，直接返回 null 表示没有 next 元素了。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7522c38706234d14818c150f54aaa38b~tplv-k3u1fbpfcp-watermark.awebp)

然后创建 4 个对象，通过赋值 next（背后调用 Object.setPrototypeOf 函数），将它们依次链接起来。跟前面关于链表的截图一样，我们让 A 作为链表的第一个元素（head）。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e0274db63ecf4b3a9743c377e76b7c1b~tplv-k3u1fbpfcp-watermark.awebp)

如上图所示，我们通过链表的第一个元素 a 以及 next 指针，将链表里的元素逐个打印了出来。

一种结构，是否是单向链表，其实跟它把指向下一个元素的字段叫什么无关，跟它以什么方式去储存下一个元素无关。很容易可以通过一层转换，将它恢复成我们熟悉的样貌。

基于原型链的属性查找算法，在前文我们已经展示过了，就是一个简单的算法：在一个单向链表上进行遍历，逐个检查每个节点是否包含某个属性名，返回第一个包含该属性名的节点的属性值。

我们可以重新梳理一下对 JS 原型的表述：一个以隐式引用作为存储方式，以点操作符和属性访问语句作为语法糖的单向链表。

并且，原型链并没有发挥出单向链表的全部能力。大部分情况下，只用到了 addFirst 这个操作（即原型继承）。极少场景使用 addLast, traversing, insertBefore, insertAfter 等链表操作。

换句话说，JS 原型是一个只用了部分能力的单向链表。

而 class 可以被更细粒度的 Prototype 所模拟，意味着它里面包含的表达能力，还低于 prototype，亦即低于单向链表。

当有人跟你说：“我相信只需要单向链表的部分能力，加上一些语法糖，就能对世界进行灵活和有效的建模”。

或者是说：“我相信只要将关联数据和关联行为的代码过程模板化，再让模板之间可以简单垂直关联，就能对世界进行可靠的建模”。

你可能会觉得对方是疯了。

然而，如果他采用 class, object, instance, inherit, prototype, constructor 等带有哲学色彩的词汇，加以渲染。你会开始犹豫，怀疑是否自己理解得不够深。

再看他添油加醋，嘴里念叨起多态、继承、封装、消息传递，然后连耍 40 个设计模式的套路。你立刻确信是自己理解水平不到。

你开始硬背设计模式、寄生组合式继承等套路。忘记了它们背后对应的算法和数据结构，可能只是你刷 Leetcode 的热身部分。

如果我们能用更标准的、通用的、可解释性高的词汇，去描述当下流行的一些行业概念，或许我们更够更加容易区分，哪些是可靠的，哪些是营造的。

**5、class 和 prototype 对 web 开发都不友好**

尽管 prototype 是 JS 的核心概念，class 也已经成为 ECMAScript 标准的一部分，但不意味着它们就一定适合 web 开发。

实际上，许多案例昭示着相反的结论。

**5.1、隐式属性访问让程序更不可靠，也容易带来困惑**

通过点操作符访问属性，实质是隐式地搜索原型链上各个对象的属性。它带来便利的同时，也带来困惑。

明明我没有声明某些属性和方法，我却能访问到？

明明它不是对象，也能调用方法？

我难以理清我访问的属性和方法，来自原型链的哪一个对象。

所有属性和方法，都是不可靠的，它们很容易通过原型继承后，加以篡改。

因此，几乎所有 JS Library，它们都不会直接通过 obj.hasOwnProperty 这种方式去调用该方法。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3979cf30858403d9922b954cd4cba0b~tplv-k3u1fbpfcp-watermark.awebp)

它们会先将 Object.prototype.hasOwnProperty 保存在一个变量里，然后通过 call 的方式去调用。如此可以保证 hasOwnProperty 的行为，明确知道它是在 Object.prototype 层面的方法。

否则将可能陷入下面这种困境。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/450e7958cadf474fb1618ccc9e428f27~tplv-k3u1fbpfcp-watermark.awebp)

早年 for in 操作能将整个原型链上的属性都遍历出来，也给开发者带来了巨大的负担。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1c967d6e4544062830a85239930aea3~tplv-k3u1fbpfcp-watermark.awebp)

我们需要手动判断 key 是否属于 obj 自身，然后进行真正的操作。因此，有一些开发者，建议不用 for in，总是使用 Object.keys。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f457e8ea3314186804e01e06b7133b3~tplv-k3u1fbpfcp-watermark.awebp)

Object.keys 是 ES5 新增的静态方法，它将 obj 自身包含的所有可遍历的 key，装配成数组形式返回。配合同样是 ES5 新增的数组 forEach 方法，可以实现遍历对象的功能。

此外，在原型上追加数据和方法，会影响到所有继承该原型的对象。这原本是 prototype-based inheritance 的一大亮点。然而，在实践中，大家对此感到非常不安。

我们的页面里的代码，通常不会只包含我们自己编写的，还会包含第三方的库和框架，别的部门同事提供的 sdk，埋点，监控，组件等代码。

如果大家都往原型上挂载自己编写的方法，特别是挂载到 Object, Array, Number 等全局构造函数的原型上。所有代码都变得更不可靠，所有行为都更加难以预测，所有经验都更难复用。

每个开发者都难以控制，访问属性访问的是哪里的数据，调用方法调用的是谁编写的方法？

大家认为这种做法，相当于对全局变量和命名空间的滥用。很多年前，整个前端开发社区就达成了高度的共识，如无必要，不要随意往原型上拓展方法，特别是全局构造函数里的原型。

至于 constructor + prototype 做隐式原型继承带来的困惑，前文已经做过详细描述，这里不再赘述。

总的而言，几乎所有 prototype 在 JS 里隐式的、自动的行为，都对 Web 应用的开发者带来了很大的困惑和困扰。大家想方设法的禁用 prototype 的特性和卖点，换取更可靠的代码组织方式。

听起来是不是很有趣？当我们好不容易掌握了原型的概念和用法，准备好好利用它们的灵活性，大展拳脚，却被告知要自我克制。只能在很有限的层次上，小心翼翼地使用。

**5.2、prototype 和 class 不利于体积优化**

web 开发跟其它开发场景，有一个显著不同是，它对代码体积非常敏感。

基于 prototype 和 class 编写的代码，很难通过代码分析，在构建时进行移除不必要的代码。这项技术叫 Tree-Shaking 或者 Dead Code Elimination。

rxjs 从 v5 升级到 v6 版本时，将原本基于 prototype 的链式调用用法，修改成基于 pipe 函数的的用法。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2b9b4b22d424e04a197249e48f72ae7~tplv-k3u1fbpfcp-watermark.awebp)

如上图所示，前半部分是 rxjs v5 版本，采用了名为 do-chaining 链式调用的风格 (jQuery 也是)。

后半部分是 rxjs v6 选用的风格，基于 pipe 的高阶函数组合。

不得不说，rxjs v5 风格，在现阶段看起来更加直观一点。不过，rxjs v6 风格的 operators 不在原型上，而是独立的方法。所有使用的地方，都由用户显式引入，或者内部显式引入，很容易分析是否参与了代码执行。

当我们挂载 operators 到原型上时，基于 this[method] 访问的动态性，原型链上的任意方法，不管有没有显式调用，都不能轻易移除。为其它对象提供共享的属性和方法，这个承诺一旦做出，就难以收回。

从这点来看，对于体积敏感的 web 开发来说，rxjs v6 风格无疑是更好的。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f19f0b72fd446ad99e589572242ada9~tplv-k3u1fbpfcp-watermark.awebp)

配合将来的 pipeline-operator 语言特性，rxjs v6 风格也有望变得更易读。

**5.3、prototype/class 不利于代码复用**

React team 曾在 2018 年 10 月介绍 react-hooks 时，描述了 class-based component 的诸多问题。

1）许多逻辑处理都要使用生命周期方法，但它们各自只有一个，并且跟 class 声明强行绑定，难以找到有效的实现逻辑复用的途径。

2）状态存储必须集中在一个 state 中进行管理，不易拆分。

生命周期声明和数据状态当然得 class 绑定，这正是 class 作为对象创建的模板，将对象包含的数据和行为关联起来的职责所在。因此，从某种意义上，class-component 的问题不是一个能在 class 层面克服的问题。

使用基于函数组合的 react-hooks 模式，我们发现，原来数据和行为的关联和复用，有其它思路。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0178789c94154fc9b20180a9563072a7~tplv-k3u1fbpfcp-watermark.awebp)

在 class-component 里，我们需要在同一个生命周期里做不同的事情，并且在不同的生命周期里协调同一件事情的不同阶段。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fc45cdce013043f18e8a53e1923de0c4~tplv-k3u1fbpfcp-watermark.awebp)

我们要把状态都集中在 state 中，通过隐式的 this 和 setState 方法去访问和更新状态。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9050d41dffee4ab7b59b0b5b7326fddc~tplv-k3u1fbpfcp-watermark.awebp)

在 function-component 里，我们则能将同一件事情的数据和行为封装到一个 custom hooks 里，使用时不需要再考虑协调问题，可以简单的获取数据或触发特定行为。

思考一下，react-hooks 模式如何使代码复用变得更简单，它跟 class-component 的差别是什么？

差别是，对象这个概念的瓦解——数据、行为及其关联是三个维度，它们不应被捆绑在对象中。

数据可以单独声明（useState），行为也可以单独声明（useEffect），数据和行为可以进行可选的关联（custom-hooks）。

数据可以单独组合，行为可以单独组合，组合的数据和组合的行为可以进行再度组合。

组合的维度得到了横向和纵向的自由度扩展。

**6、重新思考对象这个概念的必要性**

回想一下，我们如何从朴素的变量，到结构体，到对象与 class？

这其中概念演进的理由，是否真的足够充分?

数据与数据之间存在关联，以结构体的方式联合起来。

数据与行为之间存在关联，作为属性和方法在对象中联合起来。

这种联合，是没有代价的吗？

不是的。

在实践中，我们发现，数据和行为各有自己的组合维度。

数据与数据的组合，如果通过对象这种捆绑了行为的方式去实施，我们经常需要去屏蔽默认行为（override 覆写方法, diamond problem 等）。

行为与行为的组合，如果通过对象这种捆绑了数据的方式去实施，我们经常需要去屏蔽多余的、冲突的字段、类型与结构。

数据、行为及其关联，不应被默认捆绑在 class 或者 object 概念中。应该以正交的 3 个独立的维度形式进行组织。

有编程语言是这样做的吗？

有的。

Functional Programing Language 里就有这样做的，比如在 Haskell 里的情况。

数据结构由 data 关键字声明。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a4a9dd8e0b59478db8148cb105384f1d~tplv-k3u1fbpfcp-watermark.awebp)

上图我声明了一个 Optional 数据类型，它要么是 None 要么是 Value a。当它作为集合看待时，它里面的元素，等于 None 集合的元素 + Value a 集合的元素，就是一个类型层面的或运算。因此也被称之为 Sum Types。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/771951763df6412e9ed0e41bec73b81c~tplv-k3u1fbpfcp-watermark.awebp)

上图我声明了一个 Pair 数据类型，它既包含 a， 也包含 b，将 a 和 b 作为整体。将它视为集合时，其元素是 a 集合的元素 * b 集合的元素。相当于 a 跟 b 进行排列组合，每个 a 都跟所有可能的 b 配对，当然是相乘啦。因此这种类型也被称之为 Product Types。

通过 data 关键字声明类型，基于内置的 Basic Types 基本数据类型， 配合 Sum Types 和 Product Types 等进行组合操作，我们可以完成数据结构维度上的组合。这种实践被称之为代数数据类型（Algebraic Data Types）。得名于其心智模型，是在对类型进行相加或相乘的代数操作。

有了数据类型和结构，我们可以通过模式匹配 + 递归的方式，编写相关行为。在命令式风格的代码里也是这样，此处不做额外展示。关键是，当几个行为之间有关联时，怎么去组织这种关联。

在 Haskell 里，可以通过名为 typeclasses 的特性，描述一组关联的行为。

比如我们想让上面的 Optional a 类型，具备 comparable 的行为特征，即可以用 a == b 检查是否相等，用 a != b 检查是否不相等。

相等和不相等，是 comparable 行为特征的两个部分，它们在代码组织上应该被关联起来。

关联行为不是用 data 关键字来声明，而是用 class 关键字。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97193b409c6d4d90a43271da4c3067e2~tplv-k3u1fbpfcp-watermark.awebp)

如上，我们通过 class 关键字声明了 Eq（Equal 的缩写）这个行为特性，它包含两个函数（按照不同喜好，可以将它们叫做方法或行为）。

这个 class 不是跟面向对象的 class 关键字一样，作为对象创建模板，既包含数据，也包含行为，以及数据和行为的实现。

在这里，class 只是定义了一个行为特性包含的结构。并没有代码实现。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6e1e03e905bb4bd2a281b7dfa830890d~tplv-k3u1fbpfcp-watermark.awebp)

如上，我们用 instance 关键字，声明了我们的 Optional a 数据类型，如何满足和实现 Eq 行为特性。我们通过数据匹配关系，定义了如何判断是否相等。然后在实现 = 方法时，偷懒地用取反的方式。

instance 在面向对象中，是实例化一个对象。在 typeclasses 语境中，并非如此，它只是表达某个类型如何满足和实现某个行为结构的要求。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af385288142c44bda962ad349b1a7c2d~tplv-k3u1fbpfcp-watermark.awebp)

如上，我们测试了 4 个 cases。只要实现了 Eq 要求的行为结构，在后续代码中，我们就可以使用 == 和 == 这两个操作。

Eq 只是其中一个，我们还可以为 Optional a 实现其它行为特征，比如可比较大小 (Orderable)，可映射(Mappable) 等等。

通过 typeclasses，行为特性的声明、实现及其组织关系，可以独立于具体的数据类型。

所有数据类型，都可以去自行实现 Eq 等行为特征。

数据和行为之间的交互，则是通过类型推断，在编译期完成。

编译器知道我们在调用操作时，是哪个类型的数据在进行操作，它会找到这个类型通过 instance 语句所实现的操作函数，将它们隐式传入该函数。

跟面向对象将对象传入隐式参数 this 不同，typeclasses 里没有对象概念，它会追踪到具体方法，精准的传递该方法。因此，它不需要像 Java 那样进行 dynamic dispatch 在运行时去确认方法来源于哪个 class。typeclasses 在编译器就完成了这个调度过程。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8fa5f4e75477424598848e72e777b982~tplv-k3u1fbpfcp-watermark.awebp)

如上，表面上看，我们的 square 只有 1 个参数，用到了 * 操作。在调用时，也只传了 1 个参数。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/188b1ad635c145ddaac1f76dc5d26b81~tplv-k3u1fbpfcp-watermark.awebp)

经过编译器的编译后，它所隐藏的参数，都被自动添加上去。在调用时，缺失的参数，也自动补全。

也就是说，行为之间的组合和关联，相当部分是编译器自动完成的。

完全不需要对象这个概念，我们也得到了在数据、行为及其交互三个维度上的组合能力，甚至做得更好。

**7、真正的设计模式**

设计模式的兴起，源于面向对象编程。然而，它们并没有很明确的定义和验证规则，总体上是开发者之间形成的朦胧共识。

很容易想到，函数式编程里采用了不同的方式去看待数据、行为及其关联，它们也应该会产出类似设计模式的事物吧？

没错。

FP 里不仅有类似设计模式的东西，而且定义上更明确，不只是有自然语言描述，还可以作为 Library 和 Frameworks。更妙的是，它们有数学上的对应。

可以视为 Algebraic Structures 在 Programming 里的体现。因为它们之间的关系，太紧密，以至于很多地方选用了相同的名称。

令不少 FP 新手闻风丧胆的 Monad/Monoid 是其中之一。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ecdd7432d8604509b3d8145cffa93c67~tplv-k3u1fbpfcp-watermark.awebp)

具体内容，不是本文的重点，按下不表。在此我们只要知道，它们有 laws，是可验证的，甚至在类型系统更完善和严格的语言中是可证明的。

我们从访问者模式，模板牧师，策略模式，观察者模式，解释器模式，享元模式等贴近生活经验的词汇，转向了 Semigroup, Monoid, Group, Functor, Monad 等更学术化和数学化的表达。

我觉得这是一个显著的进步。

**8、新的概念营造：OOP VS COP**

一下子从面向对象跳跃到函数式编程，很容易感到不适应。我们可以回到面向对象的语境中，重新梳理一下，从 FP 里可以得到什么启发。

仿照 react 将 class-component 的功能拆散，称之为 react-hooks 的做法。

我们可以把将 class 拆成数据和行为两部分自由组织的功能，称之为 class-hooks。

然后构建 class-oriented programming，将它作为 object-oriented programming 的演进版本，营造新的概念，以便于兜售（让新手程序员不产生学术抵抗心理）。

从 OOP 转向我们新的 COP 范式，显著的差别是什么？

差别在于，我们不再用单一的 class 去同时声明数据初始化和定义方法。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e91942e8bde24effbd1b0a0abce7df45~tplv-k3u1fbpfcp-watermark.awebp)

我们使用 dataclass 去单独声明数据结构，通过 Sum Types 和 Product Types 进行组合。

dataclass 的 instance 则是具体的数据。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e70b12610ce441638b7effaf80d231e9~tplv-k3u1fbpfcp-watermark.awebp)

我们通过 methodclass 去声明行为结构。

methodclass 的 instance 是具体的方法实现。

如此，我们细分了数据类和行为类，数据实例和行为实例。

相比将行为和数据捆绑在一起的 class 继承，我们的数据类和行为类都可以单独进行继承，实现起来更灵活。

多重继承的场景，也不会遇到面向对象语言 C++ 多重继承里的 [Diamond Problem](https://link.juejin.cn?target=https%3A%2F%2Flink.zhihu.com%2F%3Ftarget%3Dhttps%3A%2F%2Fen.wikipedia.org%2Fwiki%2FMultiple_inheritance)

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4d68c6b7d5543ddae73b86abddac5b4~tplv-k3u1fbpfcp-watermark.awebp)

在 OOP 里，D 多重继承了 B 和 C，而 B 和 C 都继承了 A，则 B，C 和 A 之间的同名方法协调上存在不明确空间。

在 COP 里，同个数据类跟多个行为类的组合，总是扁平化的。只要类型是明确的，行为上不会有含混空间。

我们将强调，COP 比 OOP 更加 object-based。

在 OOP 中，object 是在形式上捆绑在一起的数据和行为。

问题是，一个对象是否构成对象，跟它写在一起，还是分开写，还是其它表达形式，有直接关系吗？

对象之所以是对象，是基于它们事实上具有本质上的关联，跟它分开写，还是放到一起写无关。

在我们的 COP 中，数据和行为可以分开定义，但它们的类型昭示着它们是同一对象的两个方面：数据和行为。

我们将揶揄，以捆绑到一起的对象为中心的 OOP，从未表达过真正的对象。

对于 Animal 类，它们从未完整实现过真正的 Animal 应该具备的行为，而只是不完整的 jump 方法，run 方法。

实际上，animal 之所以会 jump 和 run，不是因为它有那个方法名，而是比 jump 和 run 更微观的行为和数据，支撑起了 jump 操作和 rum 操作。

OOP 架空实质，只围绕了方法名、类名等做文章。

在我们的 COP 中，并不追求形式上把整个对象放到一起。我们非常了解，程序只能反映对象的某些方面和片段的行为。我们不需要完整的对象，只需要对象中我们所关心的数据和行为。

这正式 “抽象” 这个词汇所表达的：舍去无关的部分。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e072d7d26c404a85b37330f91cebd2c9~tplv-k3u1fbpfcp-watermark.awebp)

因此，从上面的 compare 函数我们可以看到，Optional 表征的对象是否可以进行比较，不仅仅跟它的方法名是否叫 compare 有关，跟它内部结构是否可比较有关。

COP 是一个更真切的、富有层次感的对象建模过程。

我们指出 OOP 是 COP 的退化形式，只要将 dataclass 和 methodclass 耦合起来，就得到了 OOP 的形态。

同时我们将抗议，学术领域的 FP 使用者，将 COP 包装以专业术语等可怕的样子呈现给普通开发，抹黑了它原本的简洁性和美感；并且常年将它跟 OOP 对立起来。

我们将提倡，不要再用 FP 这个词儿了，用 COP，class-oriented programing，面向类编程。

其实 OOP 开发者早就逐渐意识到捆绑带来的问题，开始呼吁组合优于继承云云。

声明一个不带行为的 class，能部分起到 dataclass 的作用。

OOP 里的 interface 跟 COP 里的 methodclass 也拥有类似的功能。即声明一组行为结构，任何 implements 了该接口的 class 都能参与某些操作，如 Readable 等（Haskell 的 typeclasses 在 1989 年就提出了，Java 还未出生。《How to make ad-hoc polymorphism less ad hoc》）


