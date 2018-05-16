---
layout: post
title: Insurance and the Kelly criterion
draft: true
---

Should I buy third-party insurance for my car? Should I insure my house against fire?
How much should I be prepared to pay for such insurance?

These are questions that feel like they should be quantifiable, and as
it's natural to think about using expected value (EV) to
answer them. That means that you use a strategy which considers
how much money you lose, averaged over cases where you do and don't claim on
th einsurance policy, and only taking the policy if on average you make money. But
this doesn't work -- if an insurance policy is
positive EV (+EV) to you, then it's necessarily negative EV (-EV) to the person selling
the insurance, and it's not reasonable to expect to find such policies.

And intuitively, just considering EV isn't sufficient. Most people naturally
have the instinct that they should have house insurance -- because although the
policy is -EV, it lowers your risk, and even though it's very unlikely your
house will burn down it would be financial ruin for most people, and it's worth
paying something to avoid that.

The Kelly criterion, which can be summarized by the statement that you should
maximize the expectation of the logarithm of your wealth, is a good way to think about
these decisions. This blog post describes the idea, and works through some
examples. But if you decide to apply these results, also consult with a financial
professional (which as we'll see later doesn't include most finance or economics
students, and most young financial professionals), and read the disclaimer at the end.
<!--more-->

### How much is my wealth worth? ###

It's intuitive that the more money you have, the less each additional dollar is worth.
If you are poor, a few thousand dollars is a lot of money -- enabling you to
pay your rent and feed your family. If you're extremely rich, a few thousand
dollars is almost insignificant -- you can't do more or less with or without those
few thousands than you could already do.

The Kelly criterion quantifies this intuition, and suggests that the logarithm of your
wealth is more important than its absolute value. This idea, which is well-known
to both gamblers and investors, can also be used to make sound decisions about
insurance.

### A simple gambling application of the Kelly criterion ###

The simplest application of the Kelly criterion,
and perhaps the best known, is that you have a stake of $$S$$ dollars, and a biased coin,
that lands heads with probability $$p>\frac{1}{2}$$. You are given the opportunity to make
a series of even-money bets. Specificially, on each bet you can wager from zero
up to the current value of your stake on the result of the coin-toss.

We can use Kelly criterion to figure out how much of our stake $$x$$ to wager. If we win (with probability $$p$$,
assuming we bet on heads) we'll have $$S+x$$, and if we lose (with probability $$1-p$$, we'll have $$S-x$$. If we're maximizing
the log of our wealth, then we want to maximize $$p\mathrm{log}(S+x) + (1-p)\mathrm{log}(S-x)$$.

To maximize, we differentiate with respect to $$x$$, and set the result to zero. That gives us $$\frac{p}{S+x} - \frac{1-p}{S-x} = 0$$. That comes out to $$x=S(1-2p)$$.

So if we're sure to win ($$p=1$$), we bet everything, if we break even on average ($$p=1/2$$) we bet nothing, and
we bet a linearly increasing amount in between. For example, when heads comes up three quarters of the time ($$p=3/4$$) we bet half our current stake since three quarters is halfway between one half and one. (Another
way to say this that's more familiar to gamblers is that we bet the fraction of our stake equal to our edge).

It's instructive to compare this to the
strategy of always making the wager than maximizes EV. If the coin comes up heads three quarters
of the time, the bet with the maximum EV is to bet the entire stake. After ten throws, we have
on average around 57.7 times the original stake. On average, the Kelly strategy gives
us on average around 9.3 times the original stake. It looks like the Kelly strategy
performs poorly, but the EV maximization algorithm leaves us with nothing nearly 95 percent
of the time, and 1024 times our original stake the remaining 5 percent of the time.
Whereas the Kelly strategy leaves us with at least our original stake around 78 percent
of the time, never loses everything, and around a quarter of the time gives us
over ten times the original stake.

As the number of wagers increases, the probability of losing everything with the
EV-maximization strategy tends to 1, but the Kelly strategy continues to perform well.

This exercise was done as an experiment with 61 finance and economics students and some young finance professionals:
they were given a coin that comes up heads 60% of the time and an initial stake of $25, and allowed
up to three hours to win $250. Around a third went broke, most bet on tails at some point, and only
around one in five won the maximum of $250. Read [the paper here](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2856963), and [coverage in the Economist here](https://www.economist.com/buttonwoods-notebook/2016/11/01/irrational-tossers).

### Application to Deal or No Deal ###

"Deal or No Deal" is a UK game show with a simple premise. There's fifteen boxes which contain fifteen known amounts of money, ranging from 1p to &pound;250,000. The contestant opens up the boxes one at a time, and wins
whatever's in the last box opened. That would be an uninteresting random choice, so between each round, "the banker"
rings them up and offers them an amount of money ("the deal") which they can take and leave the game immediately without opening any more boxes. In the show, there is also some theatrical interest generated
by the fact that the boxes are held by friends and family of the contestant.

In an actual episode of the show, the contestant was left after opening 13 of the boxes with two boxes, known to contain the minimum 1p and the maximum &pound;250,000. The banker offered them &pound;88,000 to stop playing.

The expected value of this situation is &pound;125,000, which is significantly higher than the banker's offer.

Even though the deal gives up &pound;37,000 in expected value, I think many people would take this
offer: a sure &pound;88,000 is better than half a chance at &pound;250,000, and
they'd feel awful if they lost. But under what conditions is this rational?

Again, the Kelly criterion can be used to answer this. Rounding down 1p to zero to make the calculations a bit shorter, if their current wealth is $$W$$ and they want to maximize the expectation of the log of their wealth, then
they should accept the deal if $$\mathrm{log}(W+88,000)$$ is greater than $$\mathrm{log}(W)/2 + \mathrm{log}(W+250,000)/2$$. Solving that gives $$W=3,872,000/37$$ or approximately &pound;104648.

That's to say, if the contestant has wealth of 105 thousand pounds or more and wants to play
rationally (according to the Kelly criterion), they should reject the deal and play on. If they have
less than this, the should accept the &pound;88,000 and go home.

In the actual show, the contestant chose to reject the deal, and won 1p. If they were already
worth more than &pound;105,000 they can console themselves with the fact that they made the
right choice. If not, they can console themselves with the fact that most finance and economics
students and finance professionals make equally poor choices in similar situations.

### Car insurance ###

The previous examples have shown us that the Kelly criterion can be used in probabilistic
situations where it's rational to give up some expected value in order to lower risk. Of course,
that can apply to buying insurance.

As a worked example, consider buying first party car insurance for your car. That means
you'll be insured for damage to your own car, up to the cost of replacing the car. In most places,
this sort of insurance is optional, whereas third party insurance (damage to other people's
cars) is mandatory. Let's assume your car is worth $30,000, and the policy costs $500. Most
car insurance has a deductible, where you have to pay the first $1,000 or so of any claims,
but let's ignore that for simplicity.

Without actuarial tables or other statistical information, we don't know how likely it is
we'll claim on the policy at various amounts. But as a gross simplification, let's assume
the insurance company makes 10% (on average) on the policy, and that claims are either for the
total value of the car or zero. These assumptions make the best case for us wanting the policy (unless
we know that the insurance company isn't making a profit), so if the Kelly criterion tells us with
these assumptions we shouldn't take the insurance, we can be sure it's a bad idea.

From these gross assumptions, we have a probability of (500-10%)/30,000 (or 1.5 percent) of making the claim of $30,000. Like in the Deal or No Deal example, let's figure out how much wealth we need to
reject the insurance policy.

We want to take the insurance if $$(1-p)\mathrm{log}(W) + p\mathrm{log}(W-30,000) < \mathrm{log}(W-500)$$, where $$W$$ is our wealth, and $$p$$ is our probability of wrecking the car, which we've estimated at 0.015.

In this case, solving for $$W$$ tells us that we should reject the policy if we have more than $153,193 in wealth.

If we want more accurate numbers, we can try to model or estimate the probabilties of various sized claims, 
include deductibles, and perhaps better estimate the average profit of the insurance company. For example,
if we believe that car insurance is sold at no profit (or even negative profit) to the insurance company, we should buy insurance no matter how much wealth we have.

### House insurance ###

Now, let's assume we have a house worth $500,000 (ignoring the cost of the land, since fire will not
destroy that), and a total wealth of $1M. How much should we be willing
to pay for building fire insurance? As in the car insurance case, let's ignore small claims and assume that
either we either claim for the total destruction of the house or not at all. Let's also assume this is just
insurance for the building and not for the contents, which are insured separately.

We know that such fires are rare. I've seen a house burning down, but I know of no one
to whom it's happened. I'll guess at a probability of one in 50,000 per year, but I suspect that's more likely
to be an overestimate than an underestimate.

Doing the same Kelly sums as before, we want to buy insurance for a cost of $$C$$ if: $$ \mathrm{log}(1,000,000 - C) > p\mathrm{log}(1,000,000 - 500,000) + (1-p)\mathrm{log}(1,000,000)$$ where $$p$$ is our estimated 1/50,000.

This comes out to around $14 (at which price the insurance company makes about $4 on average). This was a surprise to me, as my intuition here was that the cost that one's willing to pay would be much higher, since the value of the house is a significant fraction of the total worth, but the fact that the probabilities are so small make the value of the insurance small.


### Conclusion ###

The Kelly criterion is a conservative approach to taking risks, but when you apply
it to real-world insurance scenarios, mostly you'll find it suggests you shouldn't
take optional insurance if you can take the cost of a loss, even it would be painful to
do so.

That makes sense, because people are generally overly risk-averse, and insurance
companies will price policies at levels the market will withstand, so if you try
to be optimally risk-averse then you'll find policies are overpriced.


### Disclaimer ###

This post doesn't contain financial advice, and I don't take responsibility if you
decide to buy or not buy insurance in any situation and it doesn't work out for
you.