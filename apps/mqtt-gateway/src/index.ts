import * as mqtt from 'mqtt';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const MQTT_URL = process.env.MQTT_URL || 'mqtt://mqtt:1883';
const API_URL = process.env.API_URL || 'http://api-service:3000';
const INTERNAL_TOKEN = process.env.INTERNAL_REG_TOKEN;

if (!INTERNAL_TOKEN) {
  console.error('❌ INTERNAL_REG_TOKEN not set in environment');
  process.exit(1);
}

console.log('🚀 MQTT Gateway starting...');
console.log(`📡 MQTT Broker: ${MQTT_URL}`);
console.log(`🌐 API Service: ${API_URL}`);

// Connect to MQTT broker
const client = mqtt.connect(MQTT_URL, {
  clientId: `mqtt-gateway-${Date.now()}`,
  clean: true,
  reconnectPeriod: 1000,
});

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');

  // Subscribe to registration topics
  const topics = [
    'sentient/system/register/controller',
    'sentient/system/register/device'
  ];

  topics.forEach(topic => {
    client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to subscribe to ${topic}:`, err);
      } else {
        console.log(`📬 Subscribed to: ${topic}`);
      }
    });
  });
});

client.on('error', (error) => {
  console.error('❌ MQTT connection error:', error);
});

client.on('reconnect', () => {
  console.log('🔄 Reconnecting to MQTT broker...');
});

client.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    console.log(`📥 Received on ${topic}:`, JSON.stringify(payload, null, 2));

    if (topic === 'sentient/system/register/controller') {
      await registerController(payload);
    } else if (topic === 'sentient/system/register/device') {
      await registerDevice(payload);
    }
  } catch (error) {
    console.error(`❌ Error processing message from ${topic}:`, error);
  }
});

async function registerController(data: any) {
  try {
    const response = await axios.post(
      `${API_URL}/internal/controllers/register`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-internal-token': INTERNAL_TOKEN
        },
        timeout: 5000
      }
    );

    console.log(`✅ Controller registered: ${data.controller_id}`, response.data);
  } catch (error: any) {
    if (error.response) {
      console.error(`❌ API error registering controller ${data.controller_id}:`,
        error.response.status, error.response.data);
    } else {
      console.error(`❌ Network error registering controller ${data.controller_id}:`, error.message);
    }
  }
}

async function registerDevice(data: any) {
  try {
    const response = await axios.post(
      `${API_URL}/internal/devices/register`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-internal-token': INTERNAL_TOKEN
        },
        timeout: 5000
      }
    );

    console.log(`✅ Device registered: ${data.device_id} (controller: ${data.controller_id})`);
  } catch (error: any) {
    if (error.response) {
      console.error(`❌ API error registering device ${data.device_id}:`,
        error.response.status, error.response.data);
    } else {
      console.error(`❌ Network error registering device ${data.device_id}:`, error.message);
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down MQTT Gateway...');
  client.end(false, {}, () => {
    console.log('✅ MQTT connection closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down MQTT Gateway...');
  client.end(false, {}, () => {
    console.log('✅ MQTT connection closed');
    process.exit(0);
  });
});

console.log('✅ MQTT Gateway ready and listening for registrations');
