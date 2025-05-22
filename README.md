# MUNI Course Recommender 🎓

A recommendation system for Masaryk University (MUNI) courses that helps students discover relevant courses based on their interests and preferences using natural language processing and machine learning techniques.

## Features

The system employs multiple recommendation approaches:

1. **Embedding-based recommendations** - Uses text embeddings to find semantically similar courses
2. **Keyword-based recommendations** - Uses keyword intersection to suggest related courses
3. **TF-IDF based recommendations** - Utilizes term frequency-inverse document frequency for content-based filtering

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.8+ (for development)
- Node.js and npm (for frontend development)

### Running the Application

1. Clone and setup:
   ```bash
   git clone https://github.com/tomz197/course-recommender.git
   cd course-recommender
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   cp web/backend/.env.example web/backend/.env
   cp web/frontend/.env.example web/frontend/.env
   ```

3. Launch with Docker:
   ```bash
   cd web
   docker-compose up --build
   ```

4. Access at `http://localhost:8080`

### Development Setup

For working with the notebooks:
```bash
pip install jupyter pandas numpy scikit-learn sentence-transformers matplotlib tqdm
cd notebooks
jupyter notebook
```

## Project Structure

```
├── notebooks/           # Data analysis and model training
│   ├── data/           # Course data and generated artifacts
│   └── scripts/        # Helper utilities
│
└── web/               # Web application
    ├── frontend/      # React/TypeScript UI
    ├── backend/       # FastAPI service
    └── docker-compose.yml
```

## Key Notebooks

- `visualize_embeddings.ipynb` - Interactive course embedding visualization
- `create_embeddings.ipynb` - Core embedding generation and evaluation
- `test_algorithms.ipynb` - Recommendation algorithm comparison

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the terms of the license included in the repository.
