---
layout: post
title: Everything you know about complexity is wrong
---

Who would disagree that the run-time of mergesort is $$O(n\mathrm{log}\,n)$$ and it's asymptotically optimal?
Not many programmers I reckon, except perhaps to question whether it's talking about
a model of computation that's not sufficiently close to a real computer, for example a quantum
computer or one that performs arbitrary operations in parallel (possibly
involving [sticks of spaghetti][ref-spaghetti-sort]).

[ref-spaghetti-sort]: http://en.wikipedia.org/wiki/Spaghetti_sort

However, if you try to understand how to formalize what it means for a sort
to run in $$O(n\mathrm{log}\,n)$$ and for it to be optimal,
it's surprisingly difficult to find a suitable computational model, that is,
an abstraction of a computer which elides all but the important
details of the computer: the operations it can perform, and how the memory
works.

In this post, I'll look at some of
the most common computational models used in both practice and theory, and
find out that they're all flawed in one way or another, and in fact in all
of them either mergesort doesn't run in $$O(n\mathrm{log}\,n)$$ or there's
asymptotically faster sorts.

<!--more-->

Model 1: RAM is fixed-sized words
--------------

First up is a pragmatic model. Here, every item is assumed to fit into a 64-bit
word of RAM.

This has an immediate problem: in a model where every item must fit into a 64-bit
word, there's only $$2^{64}$$ unique items, so
an array of $$n$$ items can contain at most $$2^{64}$$ unique items.
This makes sorting possible in $$O(n)$$ time using a bucket sort with $$2^{64}$$ buckets.

Another, more subtle, problem here is that the registers of our machine must also be 64-bit. That means
that there's a finite (albeit huge) range of memory available to programs, which means that
we can't even represent large arrays.

This model isn't abstract enough, and the constraint that everything fits in a single word
is too restrictive. Since what we'd do in practice is to span large data across multiple
words, let's consider a model that's like that.

Model 2: Data spans multiple fixed-sized words.
--------------

Here, we allow data to be stored across multiple fixed-sized words, just like a real computer. In this model,
to have an array of $$n$$ items, we'll need each item to have $$O(\mathrm{log}\, n)$$ bits. If we try
to use fewer bits, we'll have too many of them the same, and like in the first model, we'll be able to
sort in linear time.

Now, when we try mergesort we get that each comparison takes $$O(\mathrm{log}\,n)$$ time,
which means that even if every other detail works out, we're going to have at best
an $$O(n(\mathrm{log}\,n)^2)$$ run-time.

Again like the fixed-sized word model, we have the additional subtlety about how registers work.
They need to be able to store arbitrarily large integers, and it's not obvious how to design the machine
so that adding $$n$$ to a register is $$O(1)$$ (which is necessary for random access into an array), whilst
avoiding adding a computational backdoor that allows programs to use registers instead of RAM, giving our
machine the power of the next couple of models.

Model 3: RAM is variable-sized words.
-------

This model (a common one in the study of algorithmic complexity, and is also called the transdichotomous
model) models memory as words each of
$$w$$ bits. However, unlike the "RAM is fixed sized words" model, this $$w$$ depends on the
size of the input to a problem, and
in fact for a problem of size $$n$$, $$w = O(\mathrm{log}\, n)$$.

This model starts well: merge sort runs in $$O(n\mathrm{log}\,n)$$ time.
Unfortunately though, it can be exploited to do an unreasonable amount of computation with the
wide memory locations. A paper by Fredman,
["Surpassing the information-theoretic bound with fusion trees" (1993)][ref-fredman93],
shows that in this model there exists $$O(n\mathrm{log}\,n/\mathrm{log\,log}\,n)$$ time sorts,
using the idea of a [Fusion Tree][ref-fusion].

[ref-fredman93]: http://www.sciencedirect.com/science/article/pii/0022000093900404
[ref-fusion]: http://en.wikipedia.org/wiki/Fusion_tree


Model 4: RAM is arbitrary integers.
---------------

This model allows each memory cell to contain an arbirarily large integer.
It's already obvious that this model isn't going to satisfy us since it's strictly
more powerful than model 3. However, even though this model has diverged
from what we think of as a computer, it's surprising how powerful this model
is.

A paper by Arnold Schönhage ["On the power of random access machines" (2005)][ref-schoenhage2005]
shows that in this model, any PSPACE problem can be solved in polynomial time.
Since PSPACE includes all of NP, this is quite a feat. While in no way
comparable to the paper, a hint to how to use arbitrary integer arithmetic
to perform parallel computation is my
[blog post on computing Fibonacci numbers][ref-hankin2015].

[ref-hankin2015]: http://paulhankin.github.io/Fibonacci/
[ref-schoenhage2005]: http://link.springer.com/chapter/10.1007%2F3-540-09510-1_42

We could try to adjust the costs of arithmetic to be proportional to the number of bits used (called
the "bit cost" model). That fixes the PSPACE $$=$$ P problem, but like the
"data spans multiple words" model, we can't use merge-sort to sort $$n$$ things in $$O(n\mathrm{log}\,n)$$ time.

Conclusion
--------

Every one of our models we've looked at has either failed to allow merge sort
to work in $$O(n\mathrm{log}\,n)$$, or has enabled faster algorithms.
That's not a proof that there's no good model, but it's
certainly suggestive.

Even though the gap between complexity theory and its application to programming is
wider than it looks, it'd be silly to write off complexity theory as useless.
In practice it works well and has good predictive
power, perhaps because the calculations that
we do to compute complexity approximate a more bounded notion, where "this algorithm is
$$O(n^2)$$" means "until $$n$$ gets unreasonably large, and maybe excluding a handful of
small edge-cases, the run-time is approximately some smallish
constant times $$n^2$$." Because that's much more like what we care about.
