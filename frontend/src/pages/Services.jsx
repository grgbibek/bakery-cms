import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cake, PackageOpen, Briefcase, ChevronRight, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import { contentService } from '../services/api';

const defaultHeroImage = 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=1600';

const Services = () => {
  const [content, setContent] = useState({});

  useEffect(() => {
    contentService.getContent().then(res => {
      if (res.data.length > 0) {
        const contentObj = res.data.reduce((acc, item) => {
          acc[item.key_name] = item.value;
          return acc;
        }, {});
        setContent(contentObj);
      }
    }).catch(err => console.log('Error fetching content:', err));
  }, []);

  const cleanPhone = content.contact_phone ? content.contact_phone.replace(/\D/g, '') : '15559876543';
  const waLink = `https://wa.me/${cleanPhone}`;

  const servicesData = [
    {
      title: content.service_1_title || 'Custom Celebration Cakes',
      description: content.service_1_desc || 'From elegant wedding tiers to playful birthday designs, our master bakers craft bespoke cakes tailored precisely to your vision and taste. We use only premium ingredients to ensure it tastes as spectacular as it looks.',
      icon: <Cake size={40} color="#c38452" />,
      image: content.service_1_img || 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: content.service_2_title || 'Wholesale & Large Orders',
      description: content.service_2_desc || 'Supplying local cafes, restaurants, and corporate cafeterias. We scale our authentic artisanal baking processes to provide you with consistent, high-quality bulk orders of pastries, breads, and buns.',
      icon: <PackageOpen size={40} color="#c38452" />,
      image: content.service_2_img || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: content.service_3_title || 'Event Lunchboxes',
      description: content.service_3_desc || 'Elevate your next corporate off-site or private party with our gourmet lunchbox catering. Packed individually with fresh artisan sandwiches, seasonal salads, and signature sweet treats for a seamless dining experience.',
      icon: <Briefcase size={40} color="#c38452" />,
      image: content.service_3_img || 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        className="services-hero"
        style={{ 
          position: 'relative', 
          height: '60vh', 
          minHeight: '400px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${defaultHeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '2rem'
        }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={{ fontSize: '4rem', fontFamily: 'Playfair Display', marginBottom: '1rem' }}>{content.services_hero_title || 'Catering & Custom Orders'}</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', opacity: 0.9, lineHeight: '1.6' }}>
            {content.services_hero_subtitle || 'Elevating your special moments and corporate events with artisanal excellence.'}
          </p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
        {servicesData.map((service, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="service-card"
            style={{ 
              background: 'white',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              marginBottom: '3rem',
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
              alignItems: 'stretch'
            }}
          >
            <div className="service-card-img" style={{ flex: '1 1 300px', minHeight: '350px' }}>
              <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="service-card-body" style={{ flex: '1 1 300px', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ marginBottom: '1.5rem', background: '#f5ece3', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {service.icon}
              </div>
              <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display', color: 'var(--secondary)', marginBottom: '1rem' }}>
                {service.title}
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem' }}>
                {service.description}
              </p>
              <a 
                href={`${waLink}?text=${encodeURIComponent(`Hi, I am interested in your ${service.title} service!`)}`}
                target="_blank" rel="noreferrer"
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
                  background: 'var(--primary)', color: 'white', padding: '1rem 2rem',
                  borderRadius: '50px', textDecoration: 'none', fontWeight: 600, width: 'fit-content',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#a86a3d'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary)'}
              >
                Inquire Now <ChevronRight size={18} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <motion.section 
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem' }}
      >
        <h3 style={{ fontSize: '2rem', fontFamily: 'Playfair Display', color: 'var(--secondary)', marginBottom: '1rem' }}>Have a bespoke requirement?</h3>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Our elite team is ready to help you plan the perfect menu for your occasion.</p>
        <a 
          href={waLink} target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', color: 'var(--secondary)', border: '2px solid var(--secondary)', padding: '1rem 2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 600 }}
        >
          <Phone size={18} /> Call us at {content.contact_phone || 'our store'}
        </a>
      </motion.section>

      <Chatbot phone={content.contact_phone}/>
    </div>
  );
};

export default Services;
