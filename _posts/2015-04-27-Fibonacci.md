---
layout: post
title: An integer formula for Fibonacci numbers
---

This code, somewhat surprisingly, generates Fibonacci numbers.
{% highlight python %}
    def fib(n):
        return (4 << n*(3+n)) // ((4 << 2*n) - (2 << n) - 1) & ((2 << n) - 1)
{% endhighlight %}
In this blog post, I'll explain where it comes from and how it works.
<!--more-->

Before getting to explaining, I'll give a whirlwind background overview of
Fibonacci numbers and how to compute them. If you're already a maths whiz, you can skip
most of the introduction, quickly
skim the section "Generating functions" and then read "An integer formula".

Overview
--------

The Fibonacci numbers are a well-known sequence of numbers:

$$1, 1, 2, 3, 5, 8, 13, 21, 34, 55, \ldots$$

The $$n$$th number in the sequence is defined to be the sum of the previous two, or formally
by this recurrence relation:

$$\begin{eqnarray}
\mathrm{Fib}(0) &=& 1 \\
\mathrm{Fib}(1) &=& 1 \\
\mathrm{Fib}(n) &=& \mathrm{Fib}(n - 1) + \mathrm{Fib}(n - 2)
\end{eqnarray}$$

I've chosen to start the sequence at index 0 rather than the more usual 1.

### Computing Fibonacci numbers

There's a few different reasonably well-known ways of computing the sequence. The obvious recursive implementation is slow:

{% highlight python %}
    def fib_recursive(n):
        if n < 2: return 1
        return fib_recursive(n - 1) + fib_recursive(n - 2)
{% endhighlight %}

An iterative implementation works in $$O(n)$$ operations:

{% highlight python %}
    def fib_iter(n):
        a, b = 1, 1
        for _ in xrange(n):
            a, b = a + b, a
        return b
{% endhighlight %}

And a slightly less well-known matrix power implementation works in $$O(\mathrm{log}\ n)$$ operations.

{% highlight python %}
    def fib_matpow(n):
        m = numpy.matrix('1 1 ; 1 0') ** n
        return m.item(0)
{% endhighlight %}

The last method works by considering the `a` and `b` in `fib_iter`
as sequences, and noting that

$$
    \left( \begin{array}{c}
    a_{n+1} \\
    b_{n+1} \end{array} \right)
    =
    \left( \begin{array}{cc}
    1 & 1 \\
    1 & 0 \end{array} \right)
    \left( \begin{array}{c}
    a_n \\
    b_n \end{array} \right)
$$

From which follows

$$
    \left( \begin{array}{c}
    a_{n} \\
    b_{n} \end{array} \right)
    =
    \left( \begin{array}{cc}
    1 & 1 \\
    1 & 0 \end{array} \right) ^ n
    \left( \begin{array}{c}
    1 \\
    1 \end{array} \right)
$$

and so if $$m = \left( \begin{array}{cc}
    1 & 1 \\
    1 & 0 \end{array} \right) ^ n$$ then $$b_n = m_{11}$$ (noting that unlike Python, matrix indexes are usually 1-based).

It's $$O(\mathrm{log}\ n)$$ based on the assumption that numpy's matrix power does something like exponentation by squaring.

Another method is to find a closed form for the solution of the recurrence relation. This leads to the real-valued formula: $$\mathrm{Fib}(n) = (\phi^{n+1} - \psi^{n+1}) / \sqrt{5})$$ where $$\phi = (1 + \sqrt{5}) / 2$$ and $$\psi = (1 - \sqrt{5}) / 2$$. The practical flaw in this method is that it requires arbitrary precision real-valued arithmetic, but it works for small $$n$$.

{% highlight python %}
    def fib_phi(n):
        phi = (1 + math.sqrt(5)) / 2.0
        psi = (1 - math.sqrt(5)) / 2.0
        return int((phi ** (n+1) - psi ** (n+1)) / math.sqrt(5))
{% endhighlight %}


### Generating Functions

A generating function for an arbitrary sequence $$a_n$$ is the infinite sum $$\Sigma_n a_nx^n$$.
In the specific case of the Fibonacci numbers, that means $$\Sigma_n \mathrm{Fib}(n)x^n$$.
In words, it's an infinite power series, with the coefficient of $$x^n$$ being the $$n$$th
Fibonacci number.

Now,

$$\mathrm{Fib}(n+2) = \mathrm{Fib}(n+1) + \mathrm{Fib}(n)$$

Multiplying by $$x^{n+2}$$ and summing over all $$n$$, we get:

$$\Sigma_n\mathrm{Fib}(n+2)x^{n+2} = \Sigma_n\mathrm{Fib}(n+1)x^{n+2} + \Sigma_n\mathrm{Fib}(n)x^{n+2}$$

If we let $$F(x)$$ to be the generating function of $$\mathrm{Fib}$$, which is defined to be $$\Sigma_n\mathrm{Fib}(n)x^n$$ then this
equation can be simplified:

$$F(x) - x - 1 = x(F(x) - 1) + x^2F(x)$$

and simplifying,

$$F(x) = xF(x) + x^2F(x) + 1$$

We can solve this equation for $$F$$ to get

$$F(x) = \frac{1}{1 - x - x^2}$$

It's surprising that we've managed to find a small and simple formula which captures all of the Fibonacci numbers,
but it's not yet obvious how we can use it. We'll get to that in the next section.

A technical aside is that we're going to want to evaluate $$F$$ at some values of $$x$$, and we'd like the power series
to converge. We know the Fibonacci numbers grow like $$\phi^n$$ and that geometric
series $$\Sigma_n a^n$$ converge if $$|a|<1$$, so we know that if $$|x| < 1/\phi \simeq 0.618$$ then the power series
converges.

### An integer formula

Now we're ready to start understanding the Python code.

To get the intuition behind the formula, we'll evaluate the generating function $$F$$ at $$10^{-3}$$.

$$ \begin{align*}
& F(x) = \frac{1}{1 - x - x^2} \\
& F(10^{-3})  = \frac{1}{1 - 10^{-3} - 10^{-6}} \\
& = 1.001\,002\,003\,005\,008\,013\,021\,034\,055\,089\,144\,233\,377\,610\,988\,599\,588\,187\,\ldots \end{align*}$$

Interestingly, we can see some Fibonacci numbers in this decimal expansion: $$1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89$$. That seems magical and surprising, but it's because $$F(10^{-3}) = \mathrm{Fib}(0) + \mathrm{Fib}(1)/10^3 + \mathrm{Fib}(2)/10^6 + \mathrm{Fib}(3)/10^9 + \ldots$$.

In this example, the Fibonacci numbers are spaced out at multiples of $$1/1000$$, which means once they start getting bigger that 1000 they'll
start interfering with their neighbours. We can see that starting at 988 in the computation of $$F(10^{-3})$$ above: the correct Fibonacci number is 987, but there's a 1 overflowed from the next number in the sequence causing an off-by-one error. This breaks the pattern from then on.

But, for any value of $$n$$, we can arrange for the negative power of 10 to be large enough that overflows don't disturb
the $$n$$th Fibonacci. For now, we'll just assume that there's some $$k$$ which makes $$10^{-k}$$ sufficient, and we'll come back to picking it later.

Also, since we'd like to use integer maths (because it's easier to code), let's multiply by $$10^{kn}$$, which also puts the $$n$$th Fibonacci
number just to the left of the decimal point, and simplify the equation.

$$ 10^{kn} F(10^{-k}) = \frac{10^{kn}}{1 - 10^{-k} - 10^{-2k}} = \frac{10^{kn+2k}}{10^{2k} - 10^{k} - 1} $$

If we take this result modulo $$10^k$$, we'll get the $$n$$th Fibonacci number (again, assuming we've picked $$k$$ large enough).

Before proceeding, let's switch to base 2 rather than base 10, which changes nothing but will make it easier to program.

$$ 2^{kn} F(2^{-k}) = \frac{2^{k(n+2)}}{2^{2k} - 2^{k} - 1} $$

Now all that's left is to pick a value of $$k$$ large enough so that $$\mathrm{Fib}(n+1) < 2^k$$. We know that the Fibonacci numbers
grow like $$\phi^n$$, and $$\phi < 2$$, so $$k = n+1$$ is safe.

So! Putting that together:

$$ \begin{align*}
\mathrm{Fib}(n) & \equiv 2^{(n+1)n}F(2^{-(n+1)})\ \mathrm{mod}\ 2^{n+1}\\
& \equiv \frac{2^{(n+1)(n+2)}}{(2^{n+1})^2 - 2^{n+1} - 1}\ \mathrm{mod}\ 2^{n+1} \\
& \equiv \frac{2^{(n+1)(n+2)}}{2^{2n+2} - 2^{n+1} - 1}\ \mathrm{mod}\ 2^{n+1} \end{align*} $$

If we use left-shift notation that's available in python, where $$a << k = a \cdot 2^k$$ then we can write this as:

$$ \mathrm{Fib}(n)  \equiv \frac{4 << n(3+n)}{(4 << 2n) - (2 << n) - 1} \mathrm{mod}\ (2 << n)  $$

Observing that $$\mathrm{mod}\ (2 << n)$$ can be expressed as the bitwise and (`&`) of $$(2 << n) - 1$$, we reconstruct our original Python program:

{% highlight python %}
    def fib(n):
        return (4 << n*(3+n)) // ((4 << 2*n) - (2 << n) - 1) & ((2 << n) - 1)
{% endhighlight %}

Although it's curious to find a non-iterative, closed-form solution, this isn't a practical method at all. We're doing integer arithmetic with integers of size $$O(n^2)$$ bits, and in fact, before performing the final bit-wise and, we've got an integer that is the first $$n$$ Fibonacci numbers concatenated together!
