# How to Build Business Tools Leveraging the Shopify Partner API - Shopify

**URL:** https://www.shopify.com/partners/blog/partner-api

---

Skip to Content
Docs
Community
Shopify Academy
shopify.com
Log in
Join Now
Blog
Shopify News
Case Studies
Latest
More
App development
Shopify Theme Development
Front End Development
Inspiration & Creativity
Finding New Clients
See All topics
Search

Become a Shopify Partner.

Unlock business growth.

Join Today
BLOG|SHOPIFY APP DEVELOPMENT
Leveraging the Partner API: Useful Business Tools You Can Build

It can be fun to create scrappy solutions around Shopify’s APIs and build admin scripts and dashboards you can use in your business. But sometimes, it’s just easier to use an existing tool and get back to investing time in your products. In this article, Shopify app developer Daniel Sim walks you through how to get up and running with the Partner API using Ruby, and shares the business growth opportunity of leveraging Shopify Partner-created tools that support the Partner API.

Earn more revenue as a Shopify Partner

Grow your Shopify expertise and unlock new ways to earn revenue for your own business with the Shopify Partner Program.

Become a Partner

What attracted me, and a lot of Shopify Partners, to build on Shopify is that it is easy to extend. Whatever we can do through the merchant admin, we can do through the Admin API.

We build apps to help merchants get things done, enhancing core Shopify features. With data from the API, we can give merchants insights and tools to grow their businesses.

Until recently, though, our Partner Dashboard was closed off from our tinkering. Many other developers and I came up with scrappy solutions to build the tools and get the data we need to grow our businesses. We had to work with the manual CSV exports or do hacky scraping of the dashboard.

Shopify has launched a Partner API, bringing us a step closer to doing everything programmatically that we can do through the Partner Dashboard.

Derek Watson, Shopify Director of Engineering, Ecosystem, tweets, "We're super excited for Partner API and where it's headed!"

We’re super excited for Partner API and where it’s headed!

Derek Watson, Shopify Director of Engineering, Ecosystem

With this Partner API, we’re now able to replace our scrappy import scripts with some proper GraphQL. It also opens up opportunities for other products to integrate with our apps, themes, and jobs data.

First, I’ll walk you through how to get up and running with the Partner API using Ruby. Then we’ll see what others are saying about how they’ll use the API and what they're building.

How to work with the Partner API in Ruby

The Partner API uses GraphQL, which requires more work from the client than a REST API. In exchange, we get a richer way to query and return just the data that we need. What would be multiple REST queries can be a single GraphQL request.

There aren’t any client libraries for the Partner API like we have for the Admin API. I’ll walk you through how to work with the Partner API in Ruby.

We’ll start by adding the GraphQL gem, a gem that internal Shopify teams use.

# Gemfile
gem 'graphql'
$ bundle install


Then:

$ rails generate graphql:install


Since we’re not running a GraphQL server, we can delete the app/graphql directory and remove this route from config/routes.rb.

post "/graphql" to: "graphql#execute"


Shopify offers a GraphiQL Explorer through your Partner Dashboard, so you can also remove the one provided by the gem if you like. Delete this from your routes.rb:

if Rails.env.development?
mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
end


Now let’s start building!

Our GraphQL::Client needs an HTTP network adapter to make requests. We’ll create our HTTPClient class for the Partner API specific parts. 

All API requests go to a single URL. The path contains our organization ID: a unique identifier for our partner account, and the API version we want to query.

For example:

“https://partners.shopify.com/#{organization_id}/api/#{api_version}/graphql.json”

Authentication is with a custom HTTP header X-Shopify-Access-Token containing the access token we’ve created in our Partner Dashboard.

Putting this together, we have an HTTP Client like this:

Core to GraphQL is that every API has a typed schema. Our client uses this schema to make requests to the API. Since the schema can get large and does not vary between requests, we’ll save it to disk once and cache it in memory at runtime.

Here’s the code:

Once you’ve fetched partner-api-schema.json, you can, of course, remove the GraphQL::Client.dump_schema check altogether.

Now we’re ready to fetch the data we want from the Partner API. Take a look at the Partner API reference to see what’s available. Data-modifying operations are called mutations in GraphQL. The API is currently query-only; there are no mutations. 

We’ll use querying all of our monthly and annual recurring app charges in this example.

You might also like: Getting Started with GraphQL.

Writing our query

We’ll start by going to the GraphiQL explorer. Here we can browse the schema in the Documentation Explorer and craft our query. Here’s how to fire it up: 

1. From your Shopify Partner Dashboard, click Settings

2. At the bottom of the Settings page, click Manage Partner API clients

3. Push View GraphiQL Explorer next to the token you wish to use.

In the QueryRoot, we find transactions. Inside transactions, we can query for a TransactionType of AppSubscriptionSale.

For our example, we want to know when a transaction was created, how much has been paid out to us, for which app, and for which store. With GraphQL, we can selectively pull just those fields.

Run this query in your GraphiQL explorer to see the results.

GraphQL is typed. We’ve queried for the AppSubscriptionSale transaction type and requested data from its fields. Other transaction types share some fields and add their own fields too.

We cannot simply leave off the type since not all fields are available on all types. Run this query, and you’ll get an error.

We use inline fragments to query the fields we want on the types we want.

Let’s add the ServiceSale type to our query. It doesn’t have an app field. We’ll omit that from its inline fragment.

GraphQL paginates using a cursor. The query results contain a cursor string and a hasNextPage boolean. If there’s another page, we pass the cursor string on the next query, and the next page is returned. We can request up to 100 results at a time.

We’ll add these pagination fields to our query.

Now the query is ready, let’s complete our Ruby code.

Putting it all together

Our query is parsed and validated against the Partner API schema at runtime. The GraphQL gem requires the parsed query to be a constant so that we don’t inefficiently parse and validate the query every time it’s executed.

The API is rate limited to four requests per second per API client. We’ll write a simple throttler to make at most one call every 0.3 seconds.

Here’s the complete code for a Rails class to query the Partner API, paging through results.

And there you have it—how to work with the Partner API in Ruby. Now, when it comes to how this will impact partners, I’ve been hearing conversations in the partner communities on social media discussing the opportunities and the unknowns.

What’s the big deal with the Partner API?

A few partners on Twitter and Facebook have asked, What’s the big deal with the Partner API?” There are two opportunities with the Partner API: 

Internal tools 
Buy, don’t build

Partners have all kinds of interesting internal scripts and tools using CSVs and scraped data. They break when the CSV format changes or the Partner Dashboard is changed. A documented and supported Partner API makes these robust and much easier to build.

Then, it opens the possibility of buying tools instead of building our own. It can be fun to hack around on APIs and build admin scripts and dashboards. Sometimes though, I just want to pay for a useful tool and get back to investing time in my products.

We’ll see a crop of Shopify Partner tools start to grow because we can now give other products secure access to our data with scopes and revocable tokens.

There’s been a bit of chatter about what these internal and partner tools could be.

SaaS metrics 

To grow our partner businesses, we need to be on top of our SaaS metrics to know where to focus our efforts. Getting accurate and timely numbers for monthly recurring revenue (MRR), churn, lifetime customer value (LTV), and average revenue per user (ARPU) has not been easy.

SaaS metrics products can now plug directly into the Partner API. Baremetrics is working on support. A free tool I contribute to, Partner Metrics, now supports the Partner API.

Forecasting lets us model how our businesses will go in the future, helping us plan. Partners are already asking for tools like Summit to add support.

You might also like: 8 Growth Metrics Every App Developer Should Track.

Marketing attribution

It hasn’t been easy to calculate how effective a marketing campaign is. Attributing specific merchants to a campaign, how much revenue they generate for us, and how much the campaign cost has been murky. Partners are looking for more visibility of return on marketing spend.

...Can’t wait to see what tools get made. My dream is some toolset that helps devs run effective paid user acquisition for their new app.

Ben Kennedy, ShipScout

You might also like: How to Market an App: 11 Expert Tips.

Cash for partners

Shopify Capital gives merchants quick and easy access to cash. With the transparency the Partner API brings, will we see similar non-dilutive financing for Shopify App Developers?

Matt Bahr of Enquire Labs tweets his prediction that the launch of the Shopify Partner API will give app developers easier access to cash.

Prediction: With the launch of Shopify’s Partner API, app developers will soon have easier access to cash.

Matt Bahr, EnquireLabs

And just five days later, Shopify Partner Eyal Toledano, Creator at Batch Commerce, responded that his team started building a “no nonsense CRM” called Partner CRM that connects into their app dashboard and will help them manage their merchant/client lifecycle.

Partner programs

App developers often partner up with their referral programs, offering a percentage of a merchant’s monthly spend for a referral. Until recently, that’s been hard to calculate accurately. With the Partner API, we can work out exactly how much a merchant has paid us and how much to pay for the referral.

Support and CRM

Partners use customer relationship management (CRM) software and helpdesk tools like HubSpot, Zendesk, and Gorgias to support merchants. When a ticket comes in, we can more effectively help merchants if we have a view of the apps they have installed, their history with our products, and billing information. CRM and helpdesk tools can query the Partner API directly to pull this detailed view of a merchant.

Building together with the Partner API

As you can tell, I’m excited about building on our partner platform, just like we’ve been able to develop on the merchant platform. We can now get deeper insights into our businesses to grow faster. Partners can build tools for partners.

"We can now get deeper insights into our businesses to grow faster."

The Shopify Partner community is remarkable in how we work together, and the Partner API gives us a way to strengthen our relationships even more.

DS
by
Daniel Sim
Published on Mar 25, 2021
SHARE ARTICLE
Facebook
Twitter
LinkedIn
by
Daniel Sim
Published on Mar 25, 2021

Let’s grow your digital business

Get design inspiration, development tips, and practical takeaways delivered straight to your inbox.

Enter email
Get updates

No charge. Unsubscribe anytime.

POPULAR POSTS

WEB DESIGN TOOLS AND RESOURCES
10 Beautiful Ecommerce Website Color Schemes
SHOPIFY APP DEVELOPMENT
How to Build a Shopify App: The Complete Guide
WEB DESIGN TOOLS AND RESOURCES
15 Funny Lorem Ipsum Generators to Shake Up Your Design Mockups
INSPIRATION & CREATIVITY
20 Memorable Web Design Portfolio Examples to Inspire Your Own Website

POPULAR POSTS

WEB DESIGN
Inclusive Design: 12 Ways to Design for Everyone
LEARNING LIQUID
How to Manipulate Images with the img_url Filter
SHOPIFY NEWS
Create a Marketplace in Less than 8 Minutes with Shopify’s Marketplace Kit
SHOPIFY NEWS
Introducing Online Store 2.0: What it Means For Developers
Let’s grow your digital business
Get design inspiration, development tips, and practical takeaways delivered straight to your inbox.
Email here
Get updates

No charge. Unsubscribe anytime.

Grow your business with the Shopify Partner Program
Join Today
About
Careers
Press and Media
Shopify Plus
Sitemap
ONLINE STORE
Sell Online
Examples
Website Builder
Online Retail
Ecommerce Website
Domain Names
Shopping Cart
Ecommerce Hosting
Mobile Commerce
Online Store Builder
Dropshipping Business
Store Themes
POINT OF SALE
Point of Sale
Features
Hardware
SUPPORT
24/7 support
Shopify Help Center
Shopify Community
API Documentation
Free Tools
Free Stock Photos
Logo Maker
Business Name Generator
Research
Legal
SHOPIFY
Contact
Partner Program
Affiliate Program
App Developers
Investors
Blog Topics
Fulfillment
Terms of Service
Privacy Policy
USA | English