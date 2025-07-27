# 🧠 Learnable.ai

> **Transform Any Content Into Learning Resources with AI**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://www.python.org/)
[![Django Ninja](https://img.shields.io/badge/Django%20Ninja-1.4.3-green.svg)](https://django-ninja.rest-framework.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-orange.svg)](https://ai.google.dev/gemini)

A powerful AI-powered learning platform that transforms videos, audio, and text into comprehensive learning materials including summaries, quizzes, flashcards, and mind maps.

## ✨ Features

### 🎯 **Multi-Format Content Processing**
- **Video Files**: MP4, AVI, MOV, MKV, WMV, FLV, WebM, M4V
- **Audio Files**: MP3, WAV, M4A, FLAC, AAC, OGG
- **Documents**: PDF, DOCX, DOC
- **Text Input**: Direct text pasting

### 🧠 **AI-Generated Learning Resources**

#### 📝 **Smart Summaries**
- Concise, structured summaries with key points
- Word count tracking and content analysis
- Multiple summary formats for different learning styles

#### 🎯 **Interactive Quizzes**
- Multiple-choice questions with explanations
- Difficulty-based question generation
- True/false and fill-in-the-blank support

#### 📚 **Digital Flashcards**
- Key terms and concepts extraction
- Categorized flashcards by difficulty
- Optimized for effective memorization
- Export-ready format

#### 🗺️ **Mind Maps**
- Hierarchical concept visualization
- Interactive Mermaid diagrams
- Relationship mapping between concepts
- Export as SVG/PNG

### 🚀 **Advanced Features**
- **Real-time Processing**: Live progress tracking with upload status
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **API Key Management**: Secure Gemini AI integration
- **Error Handling**: Comprehensive error messages and recovery
- **File Validation**: Automatic file type and size validation

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast build times
- **Tailwind CSS** with custom design system
- **Shadcn/ui** for beautiful, accessible components
- **React Query** for efficient data fetching
- **React Router** for navigation
- **Mermaid.js** for mind map visualization

### Backend
- **Python 3.8+** with Django Ninja for fast API development
- **Google Gemini AI 2.5 Flash** for intelligent content processing
- **LangChain** for advanced AI workflows
- **Pydantic** for data validation and serialization
- **File processing** for multimedia content extraction

### AI & ML
- **Google Generative AI** for content analysis
- **LangChain Core** for AI workflow orchestration
- **Advanced prompting** for optimal learning resource generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- Google Gemini AI API key

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

## 📖 Usage Guide

### 1. **Configure API Key**
- Click the "Settings" button in the header
- Enter your Google Gemini AI API key
- Save and verify the connection

### 2. **Upload Content**
Choose from three input methods:
- **Text**: Paste your content directly
- **Files**: Drag & drop or select files
- **URL**: Enter YouTube or educational URLs

### 3. **Generate Learning Resources**
Select the type of resource you want to create:
- **Summary**: Get concise overviews
- **Quiz**: Test knowledge with questions
- **Flashcards**: Create study cards
- **Mind Map**: Visualize concepts

### 4. **Review & Export**
- Review generated content
- Regenerate if needed
- Export or share results

## 🔧 API Endpoints

### Content Processing
- `POST /api/summarize-content` - Generate summaries from multimedia
- `POST /api/generate-mindmap-multimedia` - Create mind maps
- `POST /api/generate-mcq-quiz-multimedia` - Generate quizzes
- `POST /api/generate-flashcards-multimedia` - Create flashcards

### Health & Status
- `GET /api/hello` - Health check endpoint

## 🎨 Customization

### Styling
The project uses a custom design system built on Tailwind CSS. Key customization points:

```css
/* Custom gradients and colors */
.bg-gradient-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-gradient-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
}
```

### Components
All UI components are built with Shadcn/ui and can be customized in `frontend/src/components/ui/`.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the AI capabilities
- **Shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Django Ninja** for the fast API framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/learnable.ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/learnable.ai/discussions)
- **Email**: support@learnable.ai

---

<div align="center">
  <p>Made with ❤️ by the Learnable.ai team</p>
  <p>
    <a href="https://learnable.ai">Website</a> •
    <a href="https://docs.learnable.ai">Documentation</a> •
    <a href="https://twitter.com/learnableai">Twitter</a>
  </p>
</div>
