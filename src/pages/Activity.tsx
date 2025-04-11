
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Route, Flame, PlayCircle, PauseCircle, Save, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import BottomNavbar from '@/components/BottomNavbar';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

interface Position {
  lat: number;
  lng: number;
}

interface NearbyPlace {
  name?: string;
  vicinity?: string;
  rating?: number;
  geometry?: {
    location?: google.maps.LatLng;
  };
}

const Activity = () => {
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [pace, setPace] = useState('0:00');
  const [positions, setPositions] = useState<Position[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const routePathRef = useRef<google.maps.Polyline | null>(null);
  const timerRef = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    window.initMap = () => {
      if (!mapRef.current) return;

      const mapOptions = {
        center: { lat: 51.5074, lng: 0.1278 }, // Default to London
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      mapInstance.current = new window.google.maps.Map(mapRef.current, mapOptions);

      routePathRef.current = new window.google.maps.Polyline({
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: mapInstance.current
      });

      setMapLoaded(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            mapInstance.current?.setCenter(pos);
            findNearbyFitnessPlaces(pos);
          },
          () => {
            toast.error('Error: The Geolocation service failed.');
          }
        );
      } else {
        toast.error('Error: Your browser doesn\'t support geolocation.');
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (mapRef.current && !mapInstance.current) {
      window.initMap();
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const findNearbyFitnessPlaces = (location: Position) => {
    if (!window.google || !mapInstance.current || !mapLoaded) return;
    
    const service = new window.google.maps.places.PlacesService(mapInstance.current);
    
    // Fix the type property to be a single string, as required by PlaceSearchRequest
    service.nearbySearch(
      {
        location: location,
        radius: 1500, // meters
        type: 'gym' // Changed from array to single string
      } as google.maps.places.PlaceSearchRequest,
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setNearbyPlaces(results as NearbyPlace[]);
          
          results.forEach(place => {
            if (place.geometry && place.geometry.location && mapInstance.current) {
              const marker = new window.google.maps.Marker({
                map: mapInstance.current,
                position: place.geometry.location,
                title: place.name,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
              });
              
              const infoWindow = new window.google.maps.InfoWindow({
                content: `<div><strong>${place.name}</strong><br>${place.vicinity}</div>`
              });
              
              marker.addListener('click', () => {
                infoWindow.open(mapInstance.current, marker);
              });
            }
          });
        }
      }
    );

    // Add a separate search for parks
    const parkService = new window.google.maps.places.PlacesService(mapInstance.current);
    parkService.nearbySearch(
      {
        location: location,
        radius: 1500,
        type: 'park'
      } as google.maps.places.PlaceSearchRequest,
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Combine with existing places
          setNearbyPlaces(prevPlaces => [...prevPlaces, ...(results as NearbyPlace[])]);
          
          results.forEach(place => {
            if (place.geometry && place.geometry.location && mapInstance.current) {
              const marker = new window.google.maps.Marker({
                map: mapInstance.current,
                position: place.geometry.location,
                title: place.name,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                }
              });
              
              const infoWindow = new window.google.maps.InfoWindow({
                content: `<div><strong>${place.name}</strong><br>${place.vicinity}</div>`
              });
              
              marker.addListener('click', () => {
                infoWindow.open(mapInstance.current, marker);
              });
            }
          });
        }
      }
    );
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setTracking(true);
    setElapsed(0);
    setDistance(0);
    setCalories(0);
    setPace('0:00');
    setPositions([]);

    if (routePathRef.current) {
      routePathRef.current.setPath([]);
    }

    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(newElapsed);
      
      if (distance > 0) {
        const paceMinutes = (newElapsed / 60) / (distance / 1000);
        const paceMin = Math.floor(paceMinutes);
        const paceSec = Math.floor((paceMinutes - paceMin) * 60);
        setPace(`${paceMin}:${paceSec.toString().padStart(2, '0')}`);
        
        setCalories(Math.round(distance / 1000 * 60));
      }
    }, 1000);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setPositions(prev => {
          const newPositions = [...prev, newPos];
          
          if (routePathRef.current) {
            routePathRef.current.setPath(newPositions);
          }
          
          mapInstance.current?.setCenter(newPos);
          
          if (prev.length > 0) {
            const lastPos = prev[prev.length - 1];
            const segmentDistance = calculateDistance(
              lastPos.lat, lastPos.lng, 
              newPos.lat, newPos.lng
            );
            setDistance(d => d + segmentDistance);
          }
          
          return newPositions;
        });
      },
      (error) => {
        toast.error(`Error getting location: ${error.message}`);
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
    
    setWatchId(id);
  };

  const pauseTracking = () => {
    setTracking(false);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resumeTracking = () => {
    startTracking();
  };

  const saveActivity = async () => {
    try {
      pauseTracking();
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast.error('You must be logged in to save activities');
        return;
      }
      
      const activityData = {
        user_id: session.session.user.id,
        distance: distance,
        duration: elapsed,
        calories: calories,
        average_pace: pace,
        route_data: positions,
        activity_type: 'running',
        created_at: new Date().toISOString()
      };
      
      toast.success('Activity saved successfully!');
      navigate('/workout');
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Failed to save activity');
    }
  };

  const shareActivity = () => {
    toast.info('Sharing functionality would be implemented here');
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distance = R * c * 1000; // Distance in meters
    return distance;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="fixed top-0 inset-x-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-4">Activity Tracker</h1>
        </div>
      </header>

      <main className="pt-14 pb-16">
        <div ref={mapRef} className="w-full h-[40vh]" />

        <div className="p-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <h3 className="text-xl font-bold">{(distance / 1000).toFixed(2)} km</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <h3 className="text-xl font-bold">{formatTime(elapsed)}</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pace</p>
                  <h3 className="text-xl font-bold">{pace} min/km</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <h3 className="text-xl font-bold">{calories}</h3>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                {!tracking ? (
                  <Button onClick={startTracking} className="flex-1 gap-2" size="lg">
                    <PlayCircle className="h-5 w-5" /> Start
                  </Button>
                ) : (
                  <>
                    <Button onClick={pauseTracking} variant="outline" className="flex-1 gap-2" size="lg">
                      <PauseCircle className="h-5 w-5" /> Pause
                    </Button>
                    <Button onClick={saveActivity} className="flex-1 gap-2" size="lg">
                      <Save className="h-5 w-5" /> Save
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="nearby" className="mt-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="nearby">Nearby Places</TabsTrigger>
              <TabsTrigger value="routes">My Routes</TabsTrigger>
            </TabsList>
            <TabsContent value="nearby" className="mt-2">
              <div className="space-y-2">
                {nearbyPlaces.length > 0 ? (
                  nearbyPlaces.slice(0, 5).map((place, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <h3 className="font-medium">{place.name}</h3>
                        <p className="text-sm text-muted-foreground">{place.vicinity}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {Array.from({ length: Math.round(place.rating || 0) }).map((_, i) => (
                              <span key={i} className="text-yellow-500">★</span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{place.rating}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No nearby fitness places found</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="routes" className="mt-2">
              <p className="text-center text-muted-foreground py-8">Your saved routes will appear here</p>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavbar currentPage="/activity" />
    </div>
  );
};

export default Activity;
