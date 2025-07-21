import React from 'react';
import { MapPin, AlertTriangle, Users, Smartphone, Flame, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import img from '../assests/img1.jpeg'

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Drive Safer with Crowdsourced Reports{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                 & Real-Time Alerts
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed font-bold">"Empowering communities to make roads safer — one report at a time."</p>
            

            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              A smart system that detects your location and displays nearby road hazards like potholes, 
              accidents, or waterlogging. Users can also report new hazards in real-time, enhancing road safety.
              This initiative fosters a proactive community, enhancing transparency and public safety awareness.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/signup')}
                className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-blue-500 to-orange-500 p-1">
              <div className="bg-white rounded-xl p-8">
                <img 
                  src={img}
                  alt="Road safety and navigation system"
                  className="w-full h-64 sm:h-80 object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="absolute -top-4 -left-4 sm:-left-8 bg-white rounded-xl shadow-lg p-4 animate-bounce">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <span className="text-sm font-medium">Pothole Detected</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 sm:-right-8 bg-white rounded-xl shadow-lg p-4 animate-pulse">
              <div className="flex items-center space-x-2">
                <Flame className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium">Accident Reported</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose RoadSafe?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-6 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Location</h3>
              <p className="text-gray-600">
                Automatically detects your location and shows nearby road hazards for safer navigation.
              </p>
            </div>

            <div className="group text-center p-6 rounded-xl hover:bg-orange-50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 group-hover:bg-orange-200 transition-colors">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hazard Reporting</h3>
              <p className="text-gray-600">
                Report new hazards instantly to help other drivers avoid dangerous road conditions.
              </p>
            </div>

            <div className="group text-center p-6 rounded-xl hover:bg-green-50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Join thousands of users working together to make roads safer for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      <p className="text-center mb-16 text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">Key to our platform are public visibility, enabling community comments, and a robust system for escalating high-engagement reports directly to relevant authorities.
</p>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make Roads Safer?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our community and start reporting road hazards today.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
