import { useState, useEffect } from 'react';
import './LiveActivityFeed.css';

const ACTIVITIES = [
  { name: 'Priya S.',    city: 'Mumbai',    product: 'Birkin 30',              time: '2 min ago' },
  { name: 'Arjun M.',   city: 'Delhi',     product: 'Rolex Submariner',       time: '5 min ago' },
  { name: 'Sneha R.',   city: 'Bangalore', product: 'Chanel Classic Flap',    time: '8 min ago' },
  { name: 'Vikram P.',  city: 'Chennai',   product: 'Dyson Airwrap',          time: '11 min ago' },
  { name: 'Ananya K.',  city: 'Hyderabad', product: 'LV Neverfull MM',        time: '14 min ago' },
  { name: 'Rohan T.',   city: 'Pune',      product: 'Daytona Chronograph',    time: '17 min ago' },
  { name: 'Meera L.',   city: 'Kolkata',   product: 'Prada Galleria Bag',     time: '20 min ago' },
  { name: 'Karan D.',   city: 'Ahmedabad', product: 'Gucci Horsebit Bag',     time: '23 min ago' },
  { name: 'Divya N.',   city: 'Jaipur',    product: 'Hermès Kelly 28',        time: '26 min ago' },
  { name: 'Rahul G.',   city: 'Surat',     product: 'Dyson V15 Detect',       time: '29 min ago' },
];

export default function LiveActivityFeed() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % ACTIVITIES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activity = ACTIVITIES[current];

  return (
    <div className={`live-feed ${visible ? 'show' : 'hide'}`}>
      <span className="live-dot" />
      <div className="live-text">
        <strong>{activity.name}</strong> from {activity.city} just purchased{' '}
        <strong>{activity.product}</strong>
        <span className="live-time">{activity.time}</span>
      </div>
    </div>
  );
}
