import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Video, Headphones, Target, Menu,
  X,
  Upload,
  Wand2,
  BookOpen,
  Brain,
  Map,
  FileText,
  Share2,
  Download,
  Check,
  Star,
  Zap,
  Heart, } from "lucide-react";


const HeroSection = () => {
  const features = [
    {
      icon: FileText,
      title: "Drop Content",
      description: "Upload video, audio, or text - we handle the rest!"
    },
    {
      icon: Target,
      title: "AI Transforms",
      description: "Generate MCQs, true/false, and fill-in-the-blank questions"
    },
    {
      icon: BookOpen,
      title: "Digital Flashcards",
      description: "Create memorable flashcards for effective studying"
    },
    {
      icon: Brain,
      title: "Mind Maps",
      description: "Visualize concepts with hierarchical mind maps"
    }
  ];

  return (
    <section className="pt-28 bg-green-50">
      <div className="container mx-auto px-4">
        <div className=" mb-16 justify-items-start justify-start mx-16 py-6">
          <div className="inline-flex bg-green-100 px-3 gap-2 bg-muted/50 rounded-full py-2 mb-6">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Powered by Google Gemini AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-green-600 ">
            Transform Any Content Into
            <br />
            <span className="text-foreground">Learning Resources</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Upload videos, audio, or text and instantly generate summaries, quizzes, flashcards, and mind maps using advanced AI technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <Button
              asChild
              size="lg"
              className="text-lg font-semibold text-white bg-green-500 rounded-3xl hover:bg-green-600"
            >
              <a href="/input" className="flex items-center gap-2">
                Start Learning Now
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>

            <Button  size="lg" className="text-lg font-semibold hover:bg-green-500 hover:text-white text-green-600 border-green-500 rounded-3xl border-2 px-8">
              <Video className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>

        <section id="how-it-works" className="py-16 md:py-24 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B1B1B] mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Drop Content",
                icon: Upload,
                desc: "Upload video, audio, or text - we handle the rest!",
                color: "bg-green-400",
              },
              {
                step: "02",
                title: "AI Transforms",
                icon: Wand2,
                desc: "Get flashcards, quizzes, and mind maps instantly",
                color: "bg-green-500",
              },
              {
                step: "03",
                title: "You Study",
                icon: BookOpen,
                desc: "Use your favorite learning format and ace those tests",
                color: "bg-green-600",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className={`relative p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 fade-in-on-scroll cursor-pointer 
                }`}
                
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-gray-400 mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold text-[#1B1B1B] mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B1B1B] mb-4">Everything You Need to Study Smart</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Powerful features designed for the modern learner</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "Smart Flashcards", desc: "AI-generated cards that adapt to your learning style" },
              { icon: Map, title: "Mind Maps", desc: "Visual connections that make complex topics simple" },
              { icon: FileText, title: "Interactive Quizzes", desc: "Test yourself with personalized questions" },
              { icon: Upload, title: "Multimodal Input", desc: "Upload videos, audio, PDFs, or text" },
              { icon: Share2, title: "Easy Sharing", desc: "Collaborate with classmates and study groups" },
              { icon: Download, title: "Export Anywhere", desc: "Take your study materials wherever you go" },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 fade-in-on-scroll border-0 shadow-md hover:border-green-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <feature.icon className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="text-lg font-bold text-[#1B1B1B] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
          <div className="fixed bottom-8 right-8 z-40 hidden lg:block">
          </div>
        </div>
      </section>
      
       <section className="py-16 bg-green-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-on-scroll">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1B1B1B] mb-4">The Study Struggle is Real 😅</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A modern twist on an old tale - why slow and steady wins in the age of social media
            </p>
          </div>

          <div className="relative fade-in-on-scroll">
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8">
              /*image*/
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm md:text-base font-bold text-[#1B1B1B] bg-green-200 inline-block px-4 py-2 rounded-full">
                📚 Moral: Focus on learning, not the drama! 💯
              </p>
            </div>
          </div>
        </div>
      </section>
      
      



          
        
      </div>
      
       <section className="py-16 md:py-24 bg-green-100 w-full">
  <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
    <div className="fade-in-on-scroll">
      <div className="flex justify-center mb-6">Mascot</div>
      <h2 className="text-3xl md:text-4xl font-bold text-[#1B1B1B] mb-6">
        Ready to Transform Your Learning?
      </h2>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        Join thousands of students who are already learning smarter with Hopnote. Your future self will thank you! 🎓
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-3 rounded-full">
          Start Your Journey <Heart className="w-5 h-5 ml-2" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white text-lg px-8 py-3 rounded-full bg-transparent"
        >
          Learn More
        </Button>
      </div>
    </div>
  </div>
</section>
      <footer className="bg-[#1B1B1B] text-white py-12 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-xl font-bold">Hopnote</span>
              </div>
              <p className="text-gray-400 text-sm">
                Learn smarter, not harder. Transform your study experience with AI.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-green-400">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-green-400">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-green-400">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Hopnote. All rights reserved. Made with ❤️ for learners everywhere.</p>
          </div>
        </div>
      </footer>  
    </section>


    
  );
};

export default HeroSection;