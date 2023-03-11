# Bagelfunds

Bagelfunds is a personal peer-to-peer lending/savings tracker app that follows the Indonesian custom of [arisan](https://en.wikipedia.org/wiki/Arisan), similar to what is known as [ROSCA](https://en.wikipedia.org/wiki/Rotating_savings_and_credit_association).

## Preface

This is an app developed to better understand the concepts of SQL and the usage of PostgreSQL. It has a simple CRUD functionality.

This app is created with the following Techstack.

1. [EJS](https://ejs.co/)
2. [PostgreSQL](https://www.postgresql.org/)
3. [BCrypt](https://www.npmjs.com/package/bcrypt)

## Installation & Execution

clone the project:

```
git clone https://github.com/floatingtales/bagelfunds
```

After cloning, cd into the project

```
cd bagelfunds
```

install dependencies

```
npm install
```

Install [postgreSQL](https://www.postgresql.org/download/).

Create the database `bagelfunds` in PostgreSQL by running the SQL command:

```
CREATE DATABASE bagelfunds;
```

Run all the queries in setup.sql 

Ensure that PostgreSQL runs in port 5432

Start the app:

```
npm start
```
## Lessons Learned

This is a project solidifying the concept of database design, and CRUD functionalities using raw SQL. It's a concept that I don't think is often used anymore, as we use more ORM nowadays, yet I think it's a valuable skill to learn.

One of the hardest challenge in particular is how to design the database with all the functionalities in mind and how it should relate to each other. I'm happy to have constructed an adequate database for this.


## Authors

- [@floatingtales](https://www.github.com/floatingtales)

