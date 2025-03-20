# pv254-project

Recommendation system for MUNI courses.

Checkout `./notebooks/visualize_embeddings.ipynb` for a cool visualization.

## Structure

- `/notebooks` - contains Jupyter notebooks with data analysis and model training
- `/notebooks/data` - contains data used in the notebooks
- `/notebooks/scripts` - contains scripts used in the notebooks

- `/web` - contains the web application
- `/web/frontend` - contains the frontend of the web application
- `/web/backend` - contains the backend of the web application

## Setup (web application)

### Requirements

- Docker

### Running the web application

Go to the `/web` directory and run the following commands:

```
docker-compose up --build
```

The web application should be running on `http://localhost:5173`.

## Setup (notebooks)

There isn't one, GO WITH THE FLOW!
