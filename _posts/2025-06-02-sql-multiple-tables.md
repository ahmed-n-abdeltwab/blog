---
layout: article
title: "Understanding Relationships in SQL Databases"
date: 2025-06-02
modify_date: 2025-06-02
excerpt: "This lecture explores working with multiple tables in relational databases, covering relationships, keys, Entity Relationship Diagrams (ERDs), and advanced SQL queries in SQLite."
tags: ["Database", "SQL", "LectureNotes", "CS50"]
mathjax: false
key: "sql-multiple-tables"
---

## Introduction

Have you ever tried to keep track of information that’s spread across different lists, like books and their authors, and found it tricky to connect everything? This lecture from *CS50's Introduction to Databases with SQL* dives into the world of relational databases, showing how to manage data across multiple tables. It’s like learning to organize a library where books, authors, and publishers are all neatly linked.

The lecture uses engaging real-world examples, such as the International Booker Prize book database and tracking sea lion migrations, to make complex concepts feel approachable. We learn how to move beyond single-table databases to handle multiple tables, exploring key ideas like **primary keys**, **foreign keys**, and relationships (one-to-one, one-to-many, and many-to-many). It also introduces **Entity Relationship Diagrams (ERDs)** to visualize these connections and practical SQL commands in SQLite, like JOINs and subqueries, to query data effectively.

*My key insight from this lecture is that understanding how to model and query relationships between tables is crucial for managing complex data sets efficiently.* It’s like solving a puzzle where every piece fits perfectly when you know how to connect them.

## Core Concepts

A **relational database** is a system that stores data in multiple tables, with relationships defined between them. Unlike a single-table database, this structure allows for more complex data organization and querying. For example, instead of cramming all book-related information into one table, we can split it into tables for authors, books, and publishers, linking them through keys to avoid redundancy and ensure data integrity.

## Key Characteristics

### Primary Keys and Foreign Keys

- **Primary Key**: A unique identifier for each record in a table, ensuring no two records are identical. For instance, in a books table, the **ISBN** (International Standard Book Number) acts as a primary key because each book has a unique ISBN. The lecture illustrates this with a librarian scenario, where finding a specific book titled "The Birthday Party" is easier with a unique ISBN, avoiding confusion between different editions or authors.

- **Foreign Key**: A column in one table that references a primary key in another table, creating a link between them. For example, a ratings table might include a `book_id` column that references the ISBN in the books table, connecting ratings to specific books. This is essential for building relationships across tables.

### Types of Relationships

- **One-to-One**: Each record in one table corresponds to exactly one record in another. For example, a book might have one entry in a details table with additional information like publication date.

- **One-to-Many**: One record in a table can relate to multiple records in another. For instance, one author can write multiple books, as seen in the book database example where an author like Olga Tokarczuk is linked to multiple titles.

- **Many-to-Many**: Records in one table can relate to multiple records in another, and vice versa. For example, a book can have multiple authors, and an author can write multiple books. This often requires a junction table to manage the relationships, such as a table linking books and authors.

### Entity Relationship Diagrams (ERDs)

**ERDs** are visual tools that map out the structure of a database, showing tables as boxes and relationships as lines with annotations. In the lecture, an ERD for the book database shows:
- **Authors to Books**: A line with a bar (one) on the author side and a crow’s foot (many) on the books side, indicating one author can write many books.
- **Books to Translators**: A line with a circle (zero) and crow’s foot (many) on the translators side, showing a book might have zero or many translators.
- **Notation**: Circles mean "zero," bars mean "one," arrows mean "at least one," and crow’s feet mean "many."

*This visual representation really helped me understand how tables connect, making database design less abstract.*

### Querying Multiple Tables

To retrieve data from multiple tables, the lecture covers several SQL techniques:

- **Subqueries**: Nested queries that fetch data based on conditions from related tables. For example, finding all books by a specific author might involve a subquery to get the author’s ID first.

- **JOINs**: Commands that combine rows from multiple tables based on related columns. Types include INNER JOIN, LEFT JOIN, and more, with INNER JOIN being the default in SQLite.

- **Set Operations**: Commands like **UNION**, **INTERSECT**, and **EXCEPT** combine or compare result sets. For instance, INTERSECT is used to find individuals who are both authors and translators, like Ngugi in the book database.

- **Grouping**: Using **GROUP BY** and **HAVING** to aggregate data, such as counting how many books each author has written.

## Practical Examples

The lecture provides hands-on examples to illustrate these concepts. One standout is querying sea lion migration data using a JOIN:

```sql
SELECT * FROM "sea_lions" JOIN "migrations" ON "migrations"."id" = "sea_lions"."id";
```

This **INNER JOIN** links the `sea_lions` table (with columns like name and ID) to the `migrations` table (with distance and days). The `ON` clause ensures rows are matched where the IDs are the same, producing a result that shows each sea lion’s name alongside their migration details, like how far Spot or Tiger traveled. *This example made JOINs click for me, showing how to pull together related data seamlessly.*

Another example involves the book database, where the lecture uses the International Booker Prize data to demonstrate relationships. For instance, querying books and their authors might involve a JOIN to connect the `books` and `authors` tables, or using INTERSECT to find individuals like Ngugi who are both authors and translators.

## Conclusion

This lecture opened my eyes to the power of relational databases. By learning about **primary keys**, **foreign keys**, and relationships, I now understand how to structure data across multiple tables to keep it organized and efficient. The querying techniques, like JOINs and set operations, feel like tools I can use to solve real-world problems, from managing a library’s catalog to tracking wildlife migrations. The real-world examples, especially the book database and the librarian role-play, made these concepts relatable and easier to grasp. *I’m excited to apply these ideas in my own projects, and I feel more confident about designing databases that can handle complex data relationships.*

