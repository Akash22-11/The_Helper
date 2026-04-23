require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const Pharmacy = require('./models/Pharmacy');
const logger = require('./utils/logger');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Hospital.deleteMany({});
    await Pharmacy.deleteMany({});
    console.log('Cleared existing data');

    // Sample hospitals
    const hospitals = [
      {
        name: 'City General Hospital',
        email: 'contact@citygeneralhospital.com',
        phone: '+911234567890',
        password: 'hospital123',
        location: {
          type: 'Point',
          coordinates: [88.3639, 22.5726], // Kolkata coordinates
          address: '123 Park Street, Kolkata, West Bengal 700016'
        },
        services: {
          emergency: true,
          icu: true,
          ambulance: true,
          bloodBank: true,
          pharmacy: true
        },
        specializations: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Medicine'],
        bedAvailability: {
          general: 45,
          icu: 8,
          emergency: 12
        },
        rating: 4.5,
        verified: true
      },
      {
        name: 'Apollo Multispecialty Hospital',
        email: 'info@apollomulti.com',
        phone: '+911234567891',
        password: 'hospital123',
        location: {
          type: 'Point',
          coordinates: [88.3710, 22.5675],
          address: '456 Salt Lake, Kolkata, West Bengal 700064'
        },
        services: {
          emergency: true,
          icu: true,
          ambulance: true,
          bloodBank: true,
          pharmacy: true
        },
        specializations: ['Pediatrics', 'Oncology', 'Radiology', 'Surgery'],
        bedAvailability: {
          general: 60,
          icu: 15,
          emergency: 10
        },
        rating: 4.7,
        verified: true
      },
      {
        name: 'Fortis Healthcare Center',
        email: 'contact@fortishealthcare.com',
        phone: '+911234567892',
        password: 'hospital123',
        location: {
          type: 'Point',
          coordinates: [88.3550, 22.5800],
          address: '789 EM Bypass, Kolkata, West Bengal 700054'
        },
        services: {
          emergency: true,
          icu: true,
          ambulance: true,
          bloodBank: false,
          pharmacy: true
        },
        specializations: ['Gastroenterology', 'Nephrology', 'Dermatology'],
        bedAvailability: {
          general: 35,
          icu: 6,
          emergency: 8
        },
        rating: 4.3,
        verified: true
      },
      {
        name: 'Medica Superspecialty Hospital',
        email: 'info@medicasuper.com',
        phone: '+911234567893',
        password: 'hospital123',
        location: {
          type: 'Point',
          coordinates: [88.3800, 22.5650],
          address: '321 Rabindra Sarani, Kolkata, West Bengal 700001'
        },
        services: {
          emergency: true,
          icu: true,
          ambulance: true,
          bloodBank: true,
          pharmacy: true
        },
        specializations: ['Cardiology', 'Urology', 'Pulmonology', 'Critical Care'],
        bedAvailability: {
          general: 50,
          icu: 12,
          emergency: 15
        },
        rating: 4.6,
        verified: true
      },
      {
        name: 'Peerless Hospital',
        email: 'contact@peerlesshospital.com',
        phone: '+911234567894',
        password: 'hospital123',
        location: {
          type: 'Point',
          coordinates: [88.3450, 22.5850],
          address: '555 Jawaharlal Nehru Road, Kolkata, West Bengal 700020'
        },
        services: {
          emergency: true,
          icu: false,
          ambulance: true,
          bloodBank: true,
          pharmacy: true
        },
        specializations: ['General Medicine', 'Gynecology', 'Psychiatry'],
        bedAvailability: {
          general: 40,
          icu: 0,
          emergency: 10
        },
        rating: 4.2,
        verified: true
      }
    ];

    // Sample pharmacies
    const pharmacies = [
      {
        name: 'Apollo Pharmacy',
        location: {
          type: 'Point',
          coordinates: [88.3620, 22.5730],
          address: '12 Camac Street, Kolkata, West Bengal'
        },
        phone: '+919876543210',
        email: 'apollo@pharmacy.com',
        services: {
          is24Hours: true,
          homeDelivery: true,
          onlineOrdering: true,
          homeopathy: false,
          vaccination: true,
          labTests: true
        },
        rating: 4.5,
        openingHours: {
          monday: { open: '00:00', close: '23:59' },
          tuesday: { open: '00:00', close: '23:59' },
          wednesday: { open: '00:00', close: '23:59' },
          thursday: { open: '00:00', close: '23:59' },
          friday: { open: '00:00', close: '23:59' },
          saturday: { open: '00:00', close: '23:59' },
          sunday: { open: '00:00', close: '23:59' }
        }
      },
      {
        name: 'MedPlus Pharmacy',
        location: {
          type: 'Point',
          coordinates: [88.3700, 22.5680],
          address: '34 Gariahat Road, Kolkata, West Bengal'
        },
        phone: '+919876543211',
        email: 'medplus@pharmacy.com',
        services: {
          is24Hours: false,
          homeDelivery: true,
          onlineOrdering: true,
          homeopathy: true,
          vaccination: false,
          labTests: false
        },
        rating: 4.3,
        openingHours: {
          monday: { open: '08:00', close: '22:00' },
          tuesday: { open: '08:00', close: '22:00' },
          wednesday: { open: '08:00', close: '22:00' },
          thursday: { open: '08:00', close: '22:00' },
          friday: { open: '08:00', close: '22:00' },
          saturday: { open: '08:00', close: '22:00' },
          sunday: { open: '09:00', close: '21:00' }
        }
      },
      {
        name: 'Wellness Forever',
        location: {
          type: 'Point',
          coordinates: [88.3580, 22.5790],
          address: '67 Rashbehari Avenue, Kolkata, West Bengal'
        },
        phone: '+919876543212',
        email: 'wellness@pharmacy.com',
        services: {
          is24Hours: true,
          homeDelivery: true,
          onlineOrdering: true,
          homeopathy: false,
          vaccination: true,
          labTests: true
        },
        rating: 4.6,
        openingHours: {
          monday: { open: '00:00', close: '23:59' },
          tuesday: { open: '00:00', close: '23:59' },
          wednesday: { open: '00:00', close: '23:59' },
          thursday: { open: '00:00', close: '23:59' },
          friday: { open: '00:00', close: '23:59' },
          saturday: { open: '00:00', close: '23:59' },
          sunday: { open: '00:00', close: '23:59' }
        }
      }
    ];

    // Insert data
    await Hospital.insertMany(hospitals);
    console.log(`✅ Inserted ${hospitals.length} hospitals`);

    await Pharmacy.insertMany(pharmacies);
    console.log(`✅ Inserted ${pharmacies.length} pharmacies`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample Hospital Login:');
    console.log('Email: contact@citygeneralhospital.com');
    console.log('Password: hospital123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
