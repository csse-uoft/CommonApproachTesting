
# Common Approach Sandbox Backend
---
## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Structure](#structure)
---
## Introduction

The backend of our system is designed to provide robust, efficient, and scalable support for the application, leveraging a carefully chosen tech stack. We utilize Express.js and Node.js for building and running the server-side logic, GraphDB as the primary database for essential interconnected data, Ontology for semantic data relationships, GraphDB utils to provide an object-oriented approach to interacting with GraphDB, and MongoDB for managing non-essential and unstructured data such as logs. This combination of technologies ensures a seamless integration of performance, flexibility, and advanced data management capabilities to meet the needs of our application.

### Express.js

Express.js is used as the primary web application framework. It enables us to build a flexible and modular API structure for handling HTTP requests and responses.
### Node.js
Node.js serves as the runtime environment for executing JavaScript on the server. Its non-blocking, event-driven architecture ensures high performance and scalability, which is crucial for handling concurrent requests in our system.

### GraphDB
GraphDB is at the core of our data management strategy. It is used to store and manage essential data such as:

- User data
- Data related to indicators
- Data related to organizations

The graph database structure is particularly suited for handling interconnected data and enabling advanced querying.

### GraphDB Utils

To simplify and streamline interactions with GraphDB, we leverage **GraphDB utils**, a utility library that provides an object-oriented interface. This approach abstracts complex query logic and enables developers to interact with GraphDB in a more intuitive and manageable way. It supports operations such as:

- Querying nodes and relationships  
- Managing entities as objects  
- Defining and enforcing schema-like structures  

This abstraction enhances developer productivity while maintaining flexibility for advanced graph queries.

### Ontology

Ontology is integrated into the backend to provide a semantic layer for the data in GraphDB. It helps define relationships and hierarchies among entities, enabling more meaningful data queries and fostering better understanding and navigation of the stored data.

### MongoDB

MongoDB is employed to manage non-essential data that does not require the graph structure. Examples include:

- Application logs  
- Temporary or auxiliary data  
- Unstructured or semi-structured data  

The document-based model of MongoDB ensures flexibility and simplicity in handling such data types.

### Data Distribution and Management

The division of data storage between GraphDB and MongoDB reflects our strategic approach:

- **Essential data** is stored in GraphDB to leverage its advanced graph capabilities for interconnected datasets.  
- **Non-essential data** is stored in MongoDB for efficient handling of logs and other auxiliary data that do not require the graph structure.

This hybrid approach ensures the backend remains optimized for both performance and functionality, catering to the varying requirements of our application.

---

## Installation
#### Install dependencies
```shell
npm install -g yarn
yarn install
```

#### Copy `.env` to `./backend/.env`
> `.env` includes credentials for mailing server.

#### Start GraphDB
```shell
 docker run -p 7200:7200 -d --name graphdb --restart unless-stopped -t ontotext/graphdb:10.0.2 --GDB_HEAP_SIZE=6G -Dgraphdb.workbench.maxUploadSize=2097152000
```

#### Start MongoDB
```shell
docker run --name mongo -p 27017:27017 --restart unless-stopped -d mongo:latest
```

#### Start Backend
```shell
yarn start
```
---

## Structure

- `bin/`: Contains startup scripts that initialize and run the application.
  - `www`: Serves as the primary entry point for running the server. This script prepares the server environment and starts the application, listening on a specified port.

- `config/`: Stores configuration files and general application settings.
  - `index.js`: The main configuration file, responsible for loading application settings, database connection details, and external configuration parameters.

- `helpers/`: Provides a collection of utility functions and helper modules used throughout the backend.
  - `dicts.js`: Defines dictionaries and mappings for various lookup operations.
  - `fetchHelper.js`: Offers functions to facilitate data fetching from external APIs or services.
  - `hasAccess.js`: Determines user permissions based on their assigned roles.
  - `index.js`: An index file that re-exports helper functions for simpler imports.
  - `name2Model.js`: Maps data type names to GraphDB utility models, enabling dynamic model lookups.
  - `phoneNumber.js`: Formats and parses phone numbers.
  - `validator.js`: Implements general validation utilities to ensure data integrity and correctness.

- `loaders/`: Handles initialization and configuration of different parts of the application.
  - `express.js`: Sets up Express.js, including middleware, routes, and other related configurations.
  - `graphDB.js`: Manages loading and connecting to a GraphDB database.
  - `graphdbParameter.js`: Configures parameters for GraphDB queries and connections.
  - `mongoDB.js`: Establishes and maintains the connection to a MongoDB database.
  - `namespaces.js`: Manages namespaces used with GraphDB for handling RDF data.

- `models/`:
  - `logging/`: Contains data models dedicated to logging information into MongoDB.
    - `api.js`: A Mongoose model for storing API-related information.
    - `errorLogging.js`: A Mongoose model for persisting error details in MongoDB.
  
  *(All other files in `models/` define GraphDB utility models. Each file is named after its primary model and may include additional, less frequently used models.)*

- `routes/`: Defines server-side route handlers, organizing application endpoints.
  - `baseRoute/`:
    - `base.js`: Provides fundamental routes that do not require user authorization.
  
  - `general/`: Contains general-purpose route files not fitting into other specific categories.
    - `dynamicClassInstances.js`: Manages routes for dynamic class instance operations.
    - `generalUserRoute.js`: Handles general user operations, such as basic user management and data retrieval.
    - `index.js`: Aggregates and re-exports routes defined in this directory.
    - `profiles.js`: Manages routes related to user profiles, including password resets and security questions.
    - `userTypes.js`: Provides routes for retrieving various user types.
  
  *All other route files at this level correspond to data types or functionalities indicated by their filenames, for example:*
  
  - `characteristic.js` / `characteristics.js`: Routes related to characteristics.
  - `code.js` / `codes.js`: Routes related to codes.
  - `dataDashboard.js`: Routes for handling data dashboards (aggregated data views).
  - `dataExport.js`: Routes for exporting data from the system.
  - `errorReport.js`: Routes for logging and reporting errors.
  - `fileUploading.js`: Routes for managing file uploads and related operations.

- `services/`: Implements endpoint functionalities, performing operations and data manipulation while interacting with models and external sources.

  *(Folders named after data types usually follow a pattern:*  
  - *`dataType/`*
    - *`dataType.js`: Core logic for handling a single data type object.*
    - *`dataTypeBuilder.js`: Utilities for assembling and updating data type objects through interfaces or file uploads.*
    - *`dataTypes.js`: Functions and operations related to multiple data type objects.*
  
  *Examples: `characteristic/`, `code/`, `dataset/` and others follow this pattern.)*

  *Only files deviating from this pattern are listed below:*
  
  - `address/`:
    - `index.js`: Aggregates and re-exports address-related services.
    - `streetDirections.js`: Handles logic related to street directions (e.g., N, S, E, W).
    - `streetTypes.js`: Defines various street types (e.g., Road, Avenue, Boulevard).
  
  - `dataDashboard/`:
    - `dataDashboard.js`: Implements logic for retrieving and structuring data into dashboards.
  
  - `dataExport/`:
    - `dataExport.js`: Core logic and functions for exporting data.
  
  - `errorReport/`:
    - `frontendErrorReport.js`: Specializes in handling and routing front-end error reports for storage.
  
  - `fileUploading/`:
    - `configs.js`: Provides configuration settings for file uploads, including handling files with missing properties.
    - `fileUploading.js`: Core logic for file uploading operations.
    - `fileUploadingDirectly.js`: Specialized logic for direct file uploads without preliminary checks.
    - `fileUploadingHander.js`: A handler utility for managing and processing various file uploads.
    - `fileUploadingMultiSubArray.js`: Handles file uploads involving multiple organizations.
  
  - `middleware/`:
    - `auth.js`: Authentication middleware that verifies user tokens and sessions.
    - `errorHandler.js`: Middleware for catching and processing errors, returning standardized error responses.
  
  - `nodeGraph/`:
    - `nodeGraphData.js`: Services related to generating and handling node graph data.
  
  - `profile/`:
    - `profile.js`: Core logic for retrieving and updating user profile data.
  
  - `sankeyDiagram/`:
    - `sankeyDiagram.js`: Prepares data for Sankey Diagram visualizations.
  
  - `userAccount/`:
    - `auth.js`: Manages user authentication activities, including sign-up, sign-in, and sign-out.
    - `email.js`: Sends user account-related emails (e.g., verification messages).
    - `firstEntry.js`: Handles the user's initial entry into the system (initial setup and registration).
    - `securityQuestions.js`: Manages user security questions for authentication.
    - `user.js`: Core logic for managing an individual user account.
    - `users.js`: Core logic for handling multiple user accounts.
    - `verifyUser`: Verifies that users have the necessary authorization to modify their accounts.
  
  - `users/`:
    - `invite.js`: Handles user invitations, including generating links, tokens, and related notifications.
    - `users.js`: Provides operations for managing multiple user entities, including retrieval and deletion.
  
  - `deleteOrganizationWithAllData.js`: Utility for deleting an organization and all associated records.
  
  - `dynamicClassInstances.js`: Retrieves and manages dynamic class instances within the application.
  
  - `helpers.js`: A collection of general helper functions used throughout the backend.
  
  - `userTypes.js`: Logic related to handling various user roles.

- `utils/`: Offers general-purpose utility functions and support modules.

  - `constants/`:
    - `province.js`: Defines province-level constants, including names, codes, and types.
  
  - `error/`:
    - `index.js`: Extends Error handling, enabling customized formatting and management of various error types.
  
  - `hashing/`:
    - `index.js`: Implements hashing algorithms, typically for password security.
  
  - `mailer/`:
    - `index.js`: Core logic for sending emails.
    - `template.js`: Defines templates for different types of emails.



