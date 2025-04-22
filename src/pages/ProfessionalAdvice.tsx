
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ChevronLeft, Clock, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import BottomNavbar from '@/components/BottomNavbar';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  price: number;
  rating: number;
  reviews: number;
  availability: string;
  image: string;
}

const professionals: Professional[] = [
  {
    id: '1',
    name: 'Dr. Rahul Sharma',
    specialty: 'Nutrition Specialist',
    experience: '10 years',
    price: 499,
    rating: 4.9,
    reviews: 124,
    availability: 'Available Today',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Priya Patel',
    specialty: 'Fitness Coach',
    experience: '8 years',
    price: 399,
    rating: 4.7,
    reviews: 98,
    availability: 'Available Tomorrow',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=300&h=300&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Vikram Singh',
    specialty: 'Physical Therapist',
    experience: '12 years',
    price: 599,
    rating: 4.8,
    reviews: 152,
    availability: 'Available Today',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&h=300&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Anjali Gupta',
    specialty: 'Yoga Instructor',
    experience: '9 years',
    price: 349,
    rating: 4.6,
    reviews: 87,
    availability: 'Available in 2 days',
    image: 'https://images.unsplash.com/photo-1593164842264-854604db2260?q=80&w=300&h=300&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Sports Medicine',
    experience: '15 years',
    price: 799,
    rating: 4.9,
    reviews: 210,
    availability: 'Available Today',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&h=300&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'Deepika Malhotra',
    specialty: 'Dietitian',
    experience: '7 years',
    price: 449,
    rating: 4.5,
    reviews: 76,
    availability: 'Available Tomorrow',
    image: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?q=80&w=300&h=300&auto=format&fit=crop'
  }
];

const ProfessionalAdvice = () => {
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const navigate = useNavigate();

  const handleBookAppointment = (professional: Professional) => {
    setSelectedProfessional(professional);
    navigate(`/payment?professional=${professional.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 pb-16 overflow-hidden">
      <motion.header 
        className="py-4 px-6 flex items-center bg-gradient-to-r from-violet-dark to-indigo-dark text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          className="mr-2 text-white hover:bg-white/10" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Professional Advice</h1>
      </motion.header>

      <main className="container mx-auto px-4 pt-6 pb-24">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Connect with Experts</h2>
          <p className="text-muted-foreground">
            Get personalized advice from top fitness and wellness professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((professional) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden h-full flex flex-col">
                <div className="aspect-video relative">
                  <img 
                    src={professional.image} 
                    alt={professional.name} 
                    className="w-full h-full object-cover" 
                  />
                  <Badge className="absolute top-3 right-3 bg-green-500">
                    {professional.availability}
                  </Badge>
                </div>
                
                <div className="p-5 flex-grow">
                  <h3 className="text-xl font-semibold mb-1">{professional.name}</h3>
                  <p className="text-violet-500 font-medium">{professional.specialty}</p>
                  
                  <div className="flex items-center mt-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium">{professional.rating}</span>
                    <span className="text-muted-foreground ml-1">({professional.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {professional.experience} experience
                  </div>
                  
                  <div className="mt-4 text-lg font-semibold">
                    ₹{professional.price} <span className="text-sm font-normal text-muted-foreground">per session</span>
                  </div>
                </div>
                
                <div className="p-5 pt-0 mt-auto">
                  <Button 
                    className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                    onClick={() => handleBookAppointment(professional)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Book Consultation
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
      
      <BottomNavbar currentPage="home" />
    </div>
  );
};

export default ProfessionalAdvice;
