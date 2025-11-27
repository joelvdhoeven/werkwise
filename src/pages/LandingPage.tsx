import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, Users, BarChart3, Shield, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">WerkWise</span>
            </div>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Open Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Werkbeheer{' '}
            <span className="text-blue-600">Vereenvoudigd</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Stroomlijn uw bedrijfsprocessen met WerkWise. Van urenregistratie tot voorraadbeheer,
            alles in één overzichtelijk platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
            >
              Bekijk Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Alles wat u nodig heeft
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Een complete oplossing voor het beheren van uw bedrijf
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-blue-600" />}
              title="Urenregistratie"
              description="Eenvoudig uren bijhouden per project en medewerker"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-green-600" />}
              title="Gebruikersbeheer"
              description="Beheer medewerkers met rollen en permissies"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-purple-600" />}
              title="Rapportages"
              description="Inzichtelijke dashboards en financiële overzichten"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-orange-600" />}
              title="Veilig & Betrouwbaar"
              description="Uw data is veilig opgeslagen en altijd beschikbaar"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Ontdek hoe WerkWise uw bedrijfsprocessen kan optimaliseren
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Start de Demo
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Briefcase className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-semibold text-white">WerkWise</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} WerkWise. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default LandingPage;
