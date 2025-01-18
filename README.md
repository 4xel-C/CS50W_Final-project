# Chemanager Web Application

## Introduction

**Chemanager** is a web application designed to manage the storage of chemicals in a research laboratory. It features a location-based system for organization and provides detailed pages for each compound, where physical properties of molecules are calculated using the RDKit package.

## How to Run the Application

### Dependencies and Virtual Environment
1. **Install dependencies:**
    - Use the requirements file to download the dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    - Or use **UV** to sync your environment:
        ```bash
        pip install uv  # If UV is not already installed
        uv sync         # Create and update your environment with the dependencies specified in the pyproject.toml file
        .venv\Scripts\activate  # Activate your virtual environment
        ```

2. **Make migrations and run the Django application:**
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver
    ```

## Distinctiveness and Complexity

**Chemanager** stands out due to its specialized focus: managing the stock of chemicals in a chemistry research environment, where monitoring the inventory can be quickly overwhelming if not rigorously organized. This application propose an ergonomic interface to help chemist or any scientist working with chemicals to help organize their inventory. It provides useful and accurate features in that regard:

- **Database Features:**
  - Stores properties of compounds (e.g., producer, purity, amount, CAS number identification).
  
- **User Management:**
  - Login system requiring users to specify their laboratory for tracking chemical and managing their locations.
  
- **Storage Organization:**
  - Users can create subdivisions ("boxes") within laboratories for better organization.

- **Dynamic Operations:**
  - Add, edit, delete compounds or boxes, update locations, and automatically synchronize data related to these operations.

- **Error Minimization:**
  - Ergonomic interface designed for chemists to reduce errors while registering information.

### Core Features:
The application was build to ensure data quality and an easy-to-use interface to encourage people using this inventory system while minimizing the risk of entering erroneous data to create over time a reliable database of chemicals.
1. **Laboratories Management:**
   - Laboratories are represented with identification codes. The number of laboratory and their identification depends only of the building they are installed and are not supposed to evolve over time.
   - In that regard, laboratories are managed only by a *superuser* via the Django admin panel and are meant to be configured only once.

2. **User Flexibility:**
   - Users are invited on their account creation to select a laboratory in which they will be able to register new compounds.
      - They can choose not to be part of a laboratory to only have the research functionnalities in case non chemists also need to check the inventory.
   - Users can create subdivisions (locations and boxes) within their laboratories for customizable storage solutions.
   - Users can register products, assign them to boxes within their laboratories.
   - Users can modify in any moments their account data, assigning themselves to another laboratory
   - Users can edit the data of any products, allowing them to relocated the compound whenever it's needed.

3. **Data Filtering and Organization:**
   - Index view displaying all laboratories and their product count in an interactive table where we can display all the products from a specific laboratory.
      - A graph displaying the count per laboratory allowing users to identify possible accumulation.
   - Filter products using a search bar (by name, laboratory or box, or CAS number).
   - View products specific to a laboratory or tag compounds as favorites for a personalized watchlist.
   - Sortable tables for improved navigation.
   - A detail page for each compound, with extended properties calculated and displayed using the *SMILE code* of the molecule if provided.

4. **Robust Data Validation:**
   - Prevent submission of invalid data (e.g., negative quantities, purity > 100%, invalid lab assignments).
   - Dynamic forms ensure users can only select valid options (e.g., existing boxes in a laboratory).
   - Deleting locations containing products will automaticly move all the products in an 'unassigned' box, prevent loosing compounds in the database.

## Technology Used

- **Backend:**
  - **SQLite3:** Database management.
  - **Python:** Core backend programming.
    - **Django:** Web framework.
    - **RDKit:** Cheminformatics library.
    - **UV:** Dependency manager.
    - **Ruff:** Code linter and formatter.

- **Frontend:**
  - **HTML/CSS and JavaScript:** Core technologies.
  - **Bootstrap:** Responsive design.
  - **Chart.js:** For rendering bar charts.

## File Details and Implementation

### Backend
- **models.py:** Defines models (Laboratory, Box, User, Product) and helper methods for API interactions and data validation.
- **helpers.py:** Contains helper functions:
  - `query_products`: Queries products based on URL and request parameters.
  - `is_valid_cas`: Validates CAS numbers using regular expressions.
- **urls.py & views.py:** Define application URLs and views.
- **pyproject.toml & uv.lock:** Manage dependencies and environment settings.

### Frontend
- **layout.html:** Main layout with a navbar and an alert container for JavaScript or Django messages.
- **index.html & index.js:** Display the homepage with a table and a bar chart of product counts per laboratory.
- **login.html, register.html, login.js, register.js:** Login and registration functionality.
- **inventory.html & inventory.js:** Display a table of products with filters (all products, user’s laboratory, watchlist, search results).
- **add.html & add.js:** Enable users to add new products to a laboratory.
- **account.html & account.js:** Account and location management panel.
- **detail.html & detail.js:** Display detailed information about a specific compound.
- **helpers.js:** Contains helper functions (e.g., CSRF cookie management, alert display) and table row builders.
- **api.js:** Contains functions for interacting with the backend API.

## Limitation and improvement possibilities
Chemanager is meant to be used to improve organization. It's not meant to track security or toxicity of compounds, which would require the user to specify much more information concerning products, making the user experience less ergonomic and heavier to use in a day to day basis. The security aspect may be automaticly implemented using APIs by fetching hazard statements (H phrases) using the CAS number of the molcules:
- https://github.com/khoivan88/find_sds (for safety data sheet)
- https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest (API to fetch chemical datas, may be used to fetch the hazard statements)
Using these methods may require an extended data analysis to make sure no compounds are ignored and should be cautiously monitored.
