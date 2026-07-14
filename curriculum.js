var curriculum = [
  {
    id: 1,
    title: 'Understanding Data Engineering',
    subtitle: 'Think in systems before you write pipelines.',
    category: 'foundation',
    color: '#ff7a59',
    lessons: [
      {
        title: 'From raw events to trusted data',
        minutes: 14,
        paragraphs: [
          'Data engineering is the discipline of making data useful, dependable, and available. A data engineer connects sources such as applications, APIs, files, and operational databases to destinations where analysts, applications, and machine learning systems can use them.',
          'A useful mental model is source → ingest → store → transform → serve → observe. Every stage has a contract: what arrives, how quickly it arrives, what shape it takes, and how failures are detected.'
        ],
        keyPoints: ['Pipelines move and reshape data; platforms make many pipelines operable.', 'Freshness, correctness, completeness, and cost are engineering requirements.', 'A dataset is a product with users, owners, and expectations.'],
        example: 'application events\n  → ingestion queue\n  → object storage\n  → transformation jobs\n  → analytics warehouse\n  → dashboards and models',
        exercise: {
          type: 'quiz',
          prompt: 'Which stage turns raw stored events into analysis-ready tables?',
          choices: ['Ingestion', 'Transformation', 'Visualization'],
          answer: 1,
          explanation: 'Transformation applies business rules, cleaning, joins, and modeling to produce useful tables.'
        }
      },
      {
        title: 'Batch and streaming pipelines',
        minutes: 16,
        paragraphs: [
          'Batch pipelines process bounded groups of data on a schedule. Streaming pipelines process events continuously or in very small windows. Neither is automatically better: the right choice follows the business latency requirement.',
          'A daily finance report may tolerate a nightly batch. Fraud detection may need seconds. Streaming adds operational complexity, so choose it when the value of lower latency justifies the cost.'
        ],
        keyPoints: ['Start from the decision deadline, not the fashionable tool.', 'Batch jobs are easier to replay and reason about.', 'Streaming systems must handle ordering, duplicates, late events, and backpressure.'],
        example: 'Batch: every night at 02:00\nStreaming: each event within 5 seconds\nMicro-batch: every 5 minutes',
        exercise: {
          type: 'quiz',
          prompt: 'A report is reviewed each Monday morning. What is the simplest suitable processing model?',
          choices: ['A weekly batch before Monday', 'Millisecond streaming', 'A manual spreadsheet only'],
          answer: 0,
          explanation: 'A scheduled batch meets the deadline with less operational complexity.'
        }
      },
      {
        title: 'Reliability and data contracts',
        minutes: 18,
        paragraphs: [
          'Reliable pipelines assume that failures will happen. They use idempotent steps, checkpoints, retries, lineage, tests, and alerts so a failure is recoverable and understandable.',
          'A data contract documents the schema, meaning, owner, quality expectations, and change policy of a dataset. Contracts reduce surprise between producers and consumers.'
        ],
        keyPoints: ['Idempotent work can be repeated without corrupting the result.', 'Observability tells you what failed, where, and who is affected.', 'Schema changes should be versioned and communicated.'],
        example: 'orders_v1 contract\n- primary key: order_id\n- freshness: < 30 minutes\n- amount: non-negative\n- owner: commerce-data',
        exercise: {
          type: 'reflection',
          prompt: 'Design a mini data contract for an orders table. Include an owner, primary key, freshness target, and two quality rules.',
          placeholder: 'Owner: ...\nPrimary key: ...\nFreshness: ...\nQuality rules: ...',
          minLength: 60
        }
      }
    ]
  },
  {
    id: 2,
    title: 'Introduction to SQL',
    subtitle: 'Read, filter, summarize, and order relational data.',
    category: 'sql',
    color: '#22c55e',
    lessons: [
      {
        title: 'SELECT the data you need',
        minutes: 18,
        paragraphs: [
          'A SQL query describes the result you want. SELECT chooses columns or expressions, while FROM chooses the source table. Limiting columns improves clarity and often reduces work.',
          'Aliases make results readable. DISTINCT removes duplicate combinations, but it should not hide a faulty join or unclear grain.'
        ],
        keyPoints: ['Prefer named columns over SELECT * in production work.', 'Use AS to give calculated fields meaningful names.', 'Understand the grain: what one row represents.'],
        example: 'SELECT customer_id,\n       name,\n       country\nFROM customers\nORDER BY customer_id;',
        exercise: {
          type: 'sql',
          prompt: 'Return customer_id, name, and country from customers, ordered by customer_id.',
          starter: 'SELECT\n  -- choose three columns\nFROM customers;',
          solution: 'SELECT customer_id, name, country\nFROM customers\nORDER BY customer_id;',
          mustInclude: ['select', 'customer_id', 'name', 'country', 'from customers', 'order by customer_id']
        }
      },
      {
        title: 'Filter rows with confidence',
        minutes: 20,
        paragraphs: [
          'WHERE removes rows before aggregation. Combine predicates with AND and OR, and use parentheses when logic could be ambiguous.',
          'NULL means missing or unknown, so comparisons such as = NULL do not work. Use IS NULL or IS NOT NULL.'
        ],
        keyPoints: ['Text values use quotes; identifiers usually do not.', 'BETWEEN is inclusive at both ends.', 'LIKE supports pattern matching with % and _.'],
        example: "SELECT name, country\nFROM customers\nWHERE active = 1\n  AND country = 'Taiwan';",
        exercise: {
          type: 'sql',
          prompt: 'Return the names of active customers in Taiwan, ordered alphabetically.',
          starter: 'SELECT name\nFROM customers\nWHERE -- add both filters\nORDER BY name;',
          solution: "SELECT name\nFROM customers\nWHERE active = 1\n  AND country = 'Taiwan'\nORDER BY name;",
          mustInclude: ['select name', 'from customers', 'where', 'active', 'country', 'taiwan', 'order by name']
        }
      },
      {
        title: 'Aggregate and group',
        minutes: 24,
        paragraphs: [
          'Aggregate functions summarize many rows. COUNT counts rows or non-null values; SUM, AVG, MIN, and MAX operate on numeric or ordered values.',
          'GROUP BY defines the grain of the output. HAVING filters completed groups, while WHERE filters input rows.'
        ],
        keyPoints: ['Every selected non-aggregate column belongs in GROUP BY.', 'Filter early with WHERE when possible.', 'Use HAVING for conditions involving aggregates.'],
        example: "SELECT customer_id,\n       ROUND(SUM(amount), 2) AS paid_total\nFROM orders\nWHERE status = 'paid'\nGROUP BY customer_id\nHAVING SUM(amount) >= 200;",
        exercise: {
          type: 'sql',
          prompt: 'For paid orders, return each customer_id and total amount. Keep totals of at least 200 and order largest first.',
          starter: "SELECT customer_id,\n       SUM(amount) AS total_amount\nFROM orders\nWHERE status = 'paid'\n-- group and filter\n;",
          solution: "SELECT customer_id, SUM(amount) AS total_amount\nFROM orders\nWHERE status = 'paid'\nGROUP BY customer_id\nHAVING SUM(amount) >= 200\nORDER BY total_amount DESC;",
          mustInclude: ['sum(', 'where', 'paid', 'group by customer_id', 'having', 'order by']
        }
      }
    ]
  },
  {
    id: 3,
    title: 'Intermediate SQL',
    subtitle: 'Write expressive queries with CTEs, conditions, and windows.',
    category: 'sql',
    color: '#3b82f6',
    lessons: [
      {
        title: 'Calculated fields and CASE',
        minutes: 22,
        paragraphs: [
          'Expressions create new values without changing the stored table. CASE adds conditional logic and is useful for classification, flags, and conditional aggregation.',
          'Keep business definitions visible: a clear CASE expression is often better than unexplained numeric codes.'
        ],
        keyPoints: ['CASE is evaluated from top to bottom.', 'Always consider an ELSE branch.', 'Calculated aliases can be reused in ORDER BY.'],
        example: "SELECT order_id, amount,\n  CASE\n    WHEN amount >= 500 THEN 'large'\n    WHEN amount >= 100 THEN 'medium'\n    ELSE 'small'\n  END AS order_size\nFROM orders;",
        exercise: {
          type: 'sql',
          prompt: "Label paid orders as 'large' when amount is at least 300, otherwise 'standard'. Return order_id, amount, and order_size.",
          starter: "SELECT order_id, amount,\n  CASE\n    -- add conditions\n  END AS order_size\nFROM orders\nWHERE status = 'paid';",
          solution: "SELECT order_id, amount,\n  CASE WHEN amount >= 300 THEN 'large' ELSE 'standard' END AS order_size\nFROM orders\nWHERE status = 'paid';",
          mustInclude: ['case', 'when', 'amount >= 300', 'then', 'else', 'end', 'where', 'paid']
        }
      },
      {
        title: 'Build queries in steps with CTEs',
        minutes: 24,
        paragraphs: [
          'A common table expression, introduced with WITH, gives a name to an intermediate result. CTEs make multi-stage logic easier to test and explain.',
          'A good CTE has a meaningful name and a single purpose. It is not automatically faster than a subquery; its first job is clarity.'
        ],
        keyPoints: ['Use one CTE per logical transformation step.', 'Reference a CTE like a temporary read-only table.', 'Test intermediate results while developing.'],
        example: "WITH paid_orders AS (\n  SELECT * FROM orders WHERE status = 'paid'\n)\nSELECT customer_id, SUM(amount) AS revenue\nFROM paid_orders\nGROUP BY customer_id;",
        exercise: {
          type: 'sql',
          prompt: 'Create a CTE named paid_orders, then calculate average paid order amount by customer_id.',
          starter: "WITH paid_orders AS (\n  -- filter orders\n)\nSELECT customer_id,\n       -- average\nFROM paid_orders\nGROUP BY customer_id;",
          solution: "WITH paid_orders AS (\n  SELECT * FROM orders WHERE status = 'paid'\n)\nSELECT customer_id, AVG(amount) AS avg_paid_amount\nFROM paid_orders\nGROUP BY customer_id;",
          mustInclude: ['with paid_orders as', 'where', 'paid', 'avg(', 'from paid_orders', 'group by customer_id']
        }
      },
      {
        title: 'Window functions',
        minutes: 28,
        paragraphs: [
          'Window functions calculate across related rows without collapsing them. The OVER clause defines the partition and ordering used by the calculation.',
          'They are ideal for rankings, running totals, moving averages, and comparisons to previous rows.'
        ],
        keyPoints: ['PARTITION BY restarts a calculation for each group.', 'ORDER BY inside OVER controls sequence.', 'ROW_NUMBER, RANK, and DENSE_RANK handle ties differently.'],
        example: 'SELECT order_id, customer_id, amount,\n  ROW_NUMBER() OVER (\n    PARTITION BY customer_id\n    ORDER BY amount DESC\n  ) AS amount_rank\nFROM orders;',
        exercise: {
          type: 'sql',
          prompt: 'Rank every order by amount within each customer using ROW_NUMBER. Return customer_id, order_id, amount, and amount_rank.',
          starter: 'SELECT customer_id, order_id, amount,\n  ROW_NUMBER() OVER (\n    -- partition and order\n  ) AS amount_rank\nFROM orders;',
          solution: 'SELECT customer_id, order_id, amount,\n  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS amount_rank\nFROM orders;',
          mustInclude: ['row_number()', 'over', 'partition by customer_id', 'order by amount desc', 'amount_rank']
        }
      }
    ]
  },
  {
    id: 4,
    title: 'Joining Data in SQL',
    subtitle: 'Combine tables without losing control of the result grain.',
    category: 'sql',
    color: '#8b5cf6',
    lessons: [
      {
        title: 'INNER JOIN and relationship keys',
        minutes: 22,
        paragraphs: [
          'A join connects rows using a condition, usually a primary-key-to-foreign-key relationship. INNER JOIN keeps only matching rows.',
          'Before joining, state the expected grain and cardinality. A one-to-many join increases row count; an unexpected many-to-many join can multiply data dramatically.'
        ],
        keyPoints: ['Qualify columns with table aliases.', 'Join on stable keys, not display names.', 'Check row counts before and after joining.'],
        example: 'SELECT o.order_id, c.name, o.amount\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id;',
        exercise: {
          type: 'sql',
          prompt: 'Return order_id, customer name, amount, and status by joining orders to customers.',
          starter: 'SELECT o.order_id,\n       -- customer name and order fields\nFROM orders AS o\nJOIN customers AS c\n  ON -- relationship;',
          solution: 'SELECT o.order_id, c.name, o.amount, o.status\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id;',
          mustInclude: ['from orders', 'join customers', 'on', 'customer_id', 'c.name', 'o.amount', 'o.status']
        }
      },
      {
        title: 'LEFT JOIN and missing relationships',
        minutes: 24,
        paragraphs: [
          'LEFT JOIN preserves every row from the left input and fills unmatched right-side columns with NULL. It is essential when absence is meaningful.',
          'Filtering a right-side column in WHERE can accidentally turn a left join into an inner join. Put right-side eligibility rules in the ON condition when unmatched left rows must remain.'
        ],
        keyPoints: ['Choose the preserved table intentionally.', 'COUNT(right.id) returns zero for unmatched rows.', 'Inspect NULLs to understand missing relationships.'],
        example: 'SELECT c.name, COUNT(o.order_id) AS order_count\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name;',
        exercise: {
          type: 'sql',
          prompt: 'List every customer and their number of orders, including customers with zero orders.',
          starter: 'SELECT c.name,\n       COUNT(o.order_id) AS order_count\nFROM customers AS c\n-- preserve every customer\nGROUP BY c.customer_id, c.name;',
          solution: 'SELECT c.name, COUNT(o.order_id) AS order_count\nFROM customers AS c\nLEFT JOIN orders AS o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY c.name;',
          mustInclude: ['left join orders', 'count(', 'on', 'group by', 'c.name']
        }
      },
      {
        title: 'Subqueries and set operations',
        minutes: 26,
        paragraphs: [
          'A subquery supplies a value or result set to another query. EXISTS is especially useful for testing whether a related row exists without multiplying the outer result.',
          'UNION combines compatible result sets and removes duplicates. UNION ALL preserves duplicates and is usually less expensive.'
        ],
        keyPoints: ['Use EXISTS for yes/no relationship checks.', 'Correlated subqueries reference the outer row.', 'Set operations require compatible column counts and types.'],
        example: "SELECT c.name\nFROM customers AS c\nWHERE EXISTS (\n  SELECT 1 FROM orders AS o\n  WHERE o.customer_id = c.customer_id\n    AND o.status = 'paid'\n);",
        exercise: {
          type: 'sql',
          prompt: 'Return customers who have at least one paid order using EXISTS.',
          starter: 'SELECT c.customer_id, c.name\nFROM customers AS c\nWHERE EXISTS (\n  SELECT 1\n  FROM orders AS o\n  WHERE -- correlate and filter\n);',
          solution: "SELECT c.customer_id, c.name\nFROM customers AS c\nWHERE EXISTS (\n  SELECT 1 FROM orders AS o\n  WHERE o.customer_id = c.customer_id\n    AND o.status = 'paid'\n);",
          mustInclude: ['where exists', 'select 1', 'from orders', 'o.customer_id = c.customer_id', 'paid']
        }
      }
    ]
  },
  {
    id: 5,
    title: 'Relational Databases',
    subtitle: 'Model entities, keys, constraints, and safe changes.',
    category: 'modeling',
    color: '#ec4899',
    lessons: [
      {
        title: 'Entities, tables, and keys',
        minutes: 20,
        paragraphs: [
          'A relational model represents entities as tables and relationships as keys. A primary key uniquely identifies each row; a foreign key references a row in another table.',
          'Good keys are stable, unique, and minimal. Surrogate numeric keys simplify joins, while natural business keys still need uniqueness rules when they matter.'
        ],
        keyPoints: ['One row should represent one instance of the table grain.', 'Primary keys cannot be null.', 'Foreign keys protect relationship integrity.'],
        example: 'customers(customer_id PK, email UNIQUE)\norders(order_id PK, customer_id FK → customers.customer_id)',
        exercise: {
          type: 'quiz',
          prompt: 'Which constraint prevents an order from referencing a customer that does not exist?',
          choices: ['CHECK', 'FOREIGN KEY', 'DEFAULT'],
          answer: 1,
          explanation: 'A foreign key requires the referenced parent key to exist.'
        }
      },
      {
        title: 'Create trustworthy tables',
        minutes: 28,
        paragraphs: [
          'DDL defines database structure. Data types communicate intent, while NOT NULL, UNIQUE, CHECK, DEFAULT, and foreign keys reject invalid states early.',
          'Constraints belong close to the data because every application and user benefits from them.'
        ],
        keyPoints: ['Choose the narrowest practical data type.', 'Use CHECK for domain rules.', 'Name important constraints so errors are understandable.'],
        example: "CREATE TABLE shipments (\n  shipment_id INTEGER PRIMARY KEY,\n  order_id INTEGER NOT NULL,\n  status TEXT NOT NULL CHECK(status IN ('queued','sent','delivered')),\n  FOREIGN KEY(order_id) REFERENCES orders(order_id)\n);",
        exercise: {
          type: 'sql',
          prompt: 'Create a suppliers table with supplier_id as the primary key, a required name, and a unique email.',
          starter: 'CREATE TABLE suppliers (\n  -- define three columns\n);',
          solution: 'CREATE TABLE suppliers (\n  supplier_id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE\n);',
          mustInclude: ['create table suppliers', 'supplier_id', 'primary key', 'name', 'not null', 'email', 'unique']
        }
      },
      {
        title: 'Transactions and safe changes',
        minutes: 22,
        paragraphs: [
          'A transaction groups statements into one atomic unit: either all succeed or all are rolled back. Transactions protect multi-step changes from partial failure.',
          'ACID summarizes transaction guarantees: atomicity, consistency, isolation, and durability.'
        ],
        keyPoints: ['BEGIN starts a transaction; COMMIT makes it durable.', 'ROLLBACK abandons uncommitted work.', 'Isolation controls how concurrent work can observe changes.'],
        example: 'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE account_id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE account_id = 2;\nCOMMIT;',
        exercise: {
          type: 'quiz',
          prompt: 'A two-step transfer fails after the debit but before the credit. Which property prevents a partial transfer?',
          choices: ['Atomicity', 'Indexing', 'Denormalization'],
          answer: 0,
          explanation: 'Atomicity makes the transaction all-or-nothing.'
        }
      }
    ]
  },
  {
    id: 6,
    title: 'Database Design',
    subtitle: 'Balance integrity, performance, and workload needs.',
    category: 'modeling',
    color: '#f59e0b',
    lessons: [
      {
        title: 'Normalization without mystery',
        minutes: 26,
        paragraphs: [
          'Normalization separates facts so each is stored in one appropriate place. It reduces update anomalies and makes rules easier to enforce.',
          'Third normal form is a useful operational target: attributes depend on the key, the whole key, and nothing but the key.'
        ],
        keyPoints: ['First normal form removes repeating groups.', 'Second normal form removes partial dependency on a composite key.', 'Third normal form removes dependency on non-key attributes.'],
        example: 'Before: orders(order_id, customer_name, customer_email, product_1, product_2)\nAfter: customers, orders, products, order_items',
        exercise: {
          type: 'quiz',
          prompt: 'Customer email is repeated on every order row. Where should it normally live?',
          choices: ['Only in customers', 'Only in products', 'In every fact table'],
          answer: 0,
          explanation: 'Customer email describes the customer and should be stored with that entity.'
        }
      },
      {
        title: 'Indexes and query plans',
        minutes: 24,
        paragraphs: [
          'An index is an additional structure that helps the database find rows without scanning the whole table. It speeds reads but consumes space and adds write cost.',
          'Index columns used frequently for selective filtering, joining, and ordering. Use the query plan to verify that an index helps the actual workload.'
        ],
        keyPoints: ['Primary keys are commonly indexed automatically.', 'Composite index order matters.', 'Too many indexes slow inserts and updates.'],
        example: 'CREATE INDEX idx_orders_customer_status\nON orders(customer_id, status);\n\nEXPLAIN QUERY PLAN\nSELECT * FROM orders\nWHERE customer_id = 3 AND status = \'paid\';',
        exercise: {
          type: 'sql',
          prompt: 'Create an index named idx_orders_status on orders(status), then inspect the plan for paid orders.',
          starter: "CREATE INDEX IF NOT EXISTS idx_orders_status\nON orders(-- column);\n\nEXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE status = 'paid';",
          solution: "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);\nEXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'paid';",
          mustInclude: ['create index', 'idx_orders_status', 'on orders', 'status', 'explain query plan']
        }
      },
      {
        title: 'Design for OLTP and analytics',
        minutes: 22,
        paragraphs: [
          'Operational systems optimize frequent small reads and writes with strict integrity. Analytical systems optimize scans, aggregation, and historical comparison.',
          'The same business may need both: normalized operational tables for transactions and dimensional models for analysis.'
        ],
        keyPoints: ['OLTP favors normalized current-state models.', 'OLAP favors read-efficient historical models.', 'Move data between them through governed pipelines.'],
        example: 'OLTP question: update one order status\nOLAP question: compare regional revenue over 24 months',
        exercise: {
          type: 'quiz',
          prompt: 'Which workload is most characteristic of an analytical warehouse?',
          choices: ['Updating one shopping cart', 'Aggregating five years of sales', 'Authenticating one login'],
          answer: 1,
          explanation: 'Large historical scans and aggregations are analytical workloads.'
        }
      }
    ]
  },
  {
    id: 7,
    title: 'Data Warehousing Concepts',
    subtitle: 'Design facts, dimensions, pipelines, and history.',
    category: 'warehouse',
    color: '#06b6d4',
    lessons: [
      {
        title: 'Grain, facts, and dimensions',
        minutes: 28,
        paragraphs: [
          'A dimensional model starts by declaring the grain: exactly what one fact row represents. Facts contain measurable events; dimensions describe the who, what, where, when, and how.',
          'A star schema keeps dimensions directly connected to a central fact table, making analytical queries easier to understand.'
        ],
        keyPoints: ['Declare the grain before choosing columns.', 'Facts should match the declared grain.', 'Dimensions provide descriptive filtering and grouping attributes.'],
        example: 'Grain: one row per order item\nFact: quantity, unit_price, discount\nDimensions: customer, product, date, region',
        exercise: {
          type: 'quiz',
          prompt: 'In a sales star schema, where does product category usually belong?',
          choices: ['Product dimension', 'Sales fact measure', 'Pipeline log'],
          answer: 0,
          explanation: 'Category describes a product and belongs in the product dimension.'
        }
      },
      {
        title: 'Query a star schema',
        minutes: 26,
        paragraphs: [
          'Analytical queries join a fact table to dimensions, then aggregate measures at the requested reporting grain.',
          'Avoid double-counting by understanding the fact grain and ensuring dimension keys are unique.'
        ],
        keyPoints: ['Filter dimensions, aggregate facts.', 'Group at the reporting grain.', 'Use additive measures carefully across time and categories.'],
        example: "SELECT d.region, SUM(f.revenue) AS revenue\nFROM fact_sales AS f\nJOIN dim_customer AS d ON f.customer_key = d.customer_key\nGROUP BY d.region;",
        exercise: {
          type: 'sql',
          prompt: 'Using fact_sales and dim_product, return revenue by product category, largest first.',
          starter: 'SELECT p.category,\n       SUM(f.revenue) AS revenue\nFROM fact_sales AS f\n-- join product dimension\n-- group and order',
          solution: 'SELECT p.category, SUM(f.revenue) AS revenue\nFROM fact_sales AS f\nJOIN dim_product AS p ON f.product_key = p.product_key\nGROUP BY p.category\nORDER BY revenue DESC;',
          mustInclude: ['sum(', 'from fact_sales', 'join dim_product', 'product_key', 'group by', 'category', 'order by']
        }
      },
      {
        title: 'ETL, ELT, and changing dimensions',
        minutes: 28,
        paragraphs: [
          'ETL transforms before loading the analytical destination. ELT loads raw data first and uses the warehouse compute engine for transformations. Modern cloud platforms often favor ELT, but governance requirements can change the choice.',
          'Slowly changing dimensions describe how attribute history is kept. Type 1 overwrites, Type 2 adds a new version row, and Type 3 keeps limited previous values.'
        ],
        keyPoints: ['Choose ETL or ELT from security, latency, cost, and platform constraints.', 'Type 2 preserves full attribute history.', 'Every pipeline should be replayable and auditable.'],
        example: 'Customer moves region:\nType 1 → update region\nType 2 → expire old row, insert new row with effective dates',
        exercise: {
          type: 'quiz',
          prompt: 'You must reproduce how a customer was classified at any historical date. Which SCD type fits?',
          choices: ['Type 1', 'Type 2', 'No dimension'],
          answer: 1,
          explanation: 'Type 2 stores multiple effective versions and preserves history.'
        }
      }
    ]
  },
  {
    id: 8,
    title: 'Snowflake SQL and Architecture',
    subtitle: 'Apply warehouse skills to a cloud-native platform.',
    category: 'warehouse',
    color: '#0ea5e9',
    lessons: [
      {
        title: 'Separate storage and compute',
        minutes: 22,
        paragraphs: [
          'Snowflake separates durable cloud storage from independent virtual warehouses that provide compute. This lets teams scale workloads separately without copying the underlying data.',
          'The services layer coordinates authentication, metadata, optimization, and transactions.'
        ],
        keyPoints: ['Virtual warehouses are compute clusters, not data containers.', 'Independent warehouses reduce workload contention.', 'Auto-suspend controls idle compute cost.'],
        example: 'Storage layer: compressed table data\nCompute layer: virtual warehouses\nCloud services: metadata, security, optimization',
        exercise: {
          type: 'quiz',
          prompt: 'Two teams query the same tables but need independent performance. What should be separated?',
          choices: ['Their virtual warehouses', 'Every source file', 'The database account'],
          answer: 0,
          explanation: 'Separate virtual warehouses give independent compute while sharing storage.'
        }
      },
      {
        title: 'Objects, roles, and least privilege',
        minutes: 24,
        paragraphs: [
          'Snowflake organizes data into databases, schemas, tables, views, and stages. Roles receive privileges, and users receive roles.',
          'Least privilege means granting only the access needed for the job. Build a role hierarchy around responsibilities rather than individual users.'
        ],
        keyPoints: ['Privileges are granted to roles.', 'USAGE is required to traverse databases, schemas, and warehouses.', 'Separate object ownership from routine analyst access.'],
        example: 'GRANT USAGE ON DATABASE analytics TO ROLE analyst;\nGRANT USAGE ON SCHEMA analytics.marts TO ROLE analyst;\nGRANT SELECT ON ALL TABLES IN SCHEMA analytics.marts TO ROLE analyst;',
        exercise: {
          type: 'quiz',
          prompt: 'What should receive SELECT privileges in a maintainable access model?',
          choices: ['A functional role', 'Every user independently', 'A CSV file'],
          answer: 0,
          explanation: 'Functional roles centralize access and simplify auditing.'
        }
      },
      {
        title: 'Snowflake-flavored transformations',
        minutes: 26,
        paragraphs: [
          'Most standard analytical SQL transfers directly to Snowflake. Platform-specific features include QUALIFY for filtering window results, stages and COPY INTO for loading, and time travel for historical access.',
          'Design transformations to be idempotent and use explicit target grains, even when the platform can scale up.'
        ],
        keyPoints: ['QUALIFY filters after window functions.', 'COPY INTO loads files from stages.', 'Scale is not a substitute for a clear model.'],
        example: "SELECT customer_id, order_id, amount,\n  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS rn\nFROM orders\nQUALIFY rn = 1;",
        exercise: {
          type: 'quiz',
          prompt: 'Which Snowflake clause filters the result of ROW_NUMBER without a subquery?',
          choices: ['QUALIFY', 'USING', 'CLUSTER'],
          answer: 0,
          explanation: 'QUALIFY filters rows after window functions are calculated.'
        }
      }
    ]
  },
  {
    id: 9,
    title: 'Communicating with Data',
    subtitle: 'Turn reliable data into honest, useful decisions.',
    category: 'communication',
    color: '#14b8a6',
    lessons: [
      {
        title: 'Choose a chart from the question',
        minutes: 18,
        paragraphs: [
          'A chart is an answer format. Start with the decision and comparison: magnitude, change over time, distribution, relationship, composition, or geography.',
          'Use the simplest encoding that makes the important comparison obvious.'
        ],
        keyPoints: ['Bars compare categories.', 'Lines show ordered change over time.', 'Scatter plots show relationships between two numeric variables.'],
        example: 'Monthly revenue trend → line chart\nRevenue by region → sorted bar chart\nPrice vs. demand → scatter plot',
        exercise: {
          type: 'quiz',
          prompt: 'Which chart best shows daily active users over twelve months?',
          choices: ['Line chart', 'Pie chart', 'Single number only'],
          answer: 0,
          explanation: 'A line chart preserves time order and makes trends visible.'
        }
      },
      {
        title: 'Design honest comparisons',
        minutes: 20,
        paragraphs: [
          'Visual integrity means the picture matches the numbers. Bar charts should normally start at zero, units must be visible, and color should encode meaning consistently.',
          'Remove decoration that competes with the data, and highlight only the information that supports the decision.'
        ],
        keyPoints: ['Use consistent scales for comparisons.', 'Reserve saturated color for emphasis.', 'Label units and data definitions.'],
        example: 'Weak: three unrelated bright colors and a truncated bar axis\nStrong: neutral bars, zero baseline, one highlighted category',
        exercise: {
          type: 'quiz',
          prompt: 'What is the main risk of starting a bar chart axis at 97 instead of 0?',
          choices: ['Small differences look dramatically larger', 'Labels become alphabetical', 'The data gains duplicates'],
          answer: 0,
          explanation: 'Bar length encodes magnitude, so a truncated baseline exaggerates differences.'
        }
      },
      {
        title: 'Tell the data product story',
        minutes: 20,
        paragraphs: [
          'A useful analytical handoff states what changed, why it matters, how confident you are, and what action is recommended.',
          'Include metric definitions, time windows, caveats, and data freshness so the audience can interpret the result responsibly.'
        ],
        keyPoints: ['Lead with the decision-relevant answer.', 'Separate evidence from interpretation.', 'Make uncertainty and limitations visible.'],
        example: 'Finding → evidence → likely driver → caveat → recommended action',
        exercise: {
          type: 'reflection',
          prompt: 'Write a five-sentence update for a manager: revenue rose 12%, paid orders rose 8%, and average order value rose 4%. Include one caveat and one recommended next step.',
          placeholder: 'Finding: ...\nEvidence: ...\nInterpretation: ...\nCaveat: ...\nNext step: ...',
          minLength: 100
        }
      }
    ]
  }
];
