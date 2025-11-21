import * as mqtt from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
import { MqttTopicBuilder } from '@sentient/shared-messaging';
import { EventType } from '@sentient/core-domain';

// Configuration
const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const ROOM_ID = process.env.ROOM_ID || 'room_demo';
const CONTROLLER_ID = process.env.CONTROLLER_ID || 'ctrl_sim_001';

interface SimulatedDevice {
  device_id: string;
  name: string;
  type: 'button' | 'sensor' | 'relay' | 'maglock';
  current_state: any;
}

class DeviceSimulator {
  private client: mqtt.MqttClient;
  private devices: SimulatedDevice[] = [];
  private intervalId?: NodeJS.Timeout;

  constructor() {
    console.log('🚀 Device Simulator starting...');
    console.log(`📡 MQTT Broker: ${MQTT_URL}`);
    console.log(`🏢 Room ID: ${ROOM_ID}`);
    console.log(`🎛️  Controller ID: ${CONTROLLER_ID}`);

    // Initialize simulated devices
    this.devices = [
      {
        device_id: 'dev_button_red',
        name: 'Red Button',
        type: 'button',
        current_state: { pressed: false },
      },
      {
        device_id: 'dev_sensor_door',
        name: 'Door Sensor',
        type: 'sensor',
        current_state: { open: false },
      },
      {
        device_id: 'dev_relay_lights',
        name: 'Room Lights Relay',
        type: 'relay',
        current_state: { on: false },
      },
      {
        device_id: 'dev_maglock_main',
        name: 'Main Door Maglock',
        type: 'maglock',
        current_state: { locked: true, power: 12.0 },
      },
    ];

    // Connect to MQTT
    this.client = mqtt.connect(MQTT_URL, {
      clientId: `device-simulator-${CONTROLLER_ID}-${Date.now()}`,
      clean: true,
      reconnectPeriod: 1000,
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.client.on('connect', () => {
      console.log('✅ Connected to MQTT broker');
      this.registerController();
      this.startSimulation();
    });

    this.client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error);
    });

    this.client.on('reconnect', () => {
      console.log('🔄 Reconnecting to MQTT broker...');
    });

    this.client.on('offline', () => {
      console.log('⚠️  MQTT client offline');
    });
  }

  private registerController(): void {
    console.log('\n📝 Registering controller...');

    const registrationPayload = {
      controller_id: CONTROLLER_ID,
      room_id: ROOM_ID,
      name: 'Simulated Controller',
      type: 'simulator',
      ip_address: '192.168.30.100',
      mac_address: 'AA:BB:CC:DD:EE:FF',
      firmware_version: '1.0.0-sim',
      hardware_version: 'simulator',
      metadata: {
        simulated: true,
        device_count: this.devices.length,
      },
    };

    this.client.publish(
      'sentient/system/register/controller',
      JSON.stringify(registrationPayload),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error('❌ Failed to publish controller registration:', err);
        } else {
          console.log('✅ Controller registration published');
        }
      }
    );

    // Register each device
    setTimeout(() => {
      this.devices.forEach((device) => {
        const deviceRegistration = {
          device_id: device.device_id,
          controller_id: CONTROLLER_ID,
          room_id: ROOM_ID,
          name: device.name,
          type: device.type,
          pin: null,
          config: {
            simulated: true,
          },
        };

        this.client.publish(
          'sentient/system/register/device',
          JSON.stringify(deviceRegistration),
          { qos: 1 },
          (err) => {
            if (err) {
              console.error(`❌ Failed to register device ${device.device_id}:`, err);
            } else {
              console.log(`✅ Device registered: ${device.name} (${device.device_id})`);
            }
          }
        );
      });
    }, 1000);
  }

  private startSimulation(): void {
    console.log('\n🎬 Starting device state simulation...\n');

    // Send initial states
    this.devices.forEach((device) => {
      this.publishDeviceState(device);
    });

    // Simulate state changes every 5 seconds
    this.intervalId = setInterval(() => {
      this.simulateRandomStateChange();
    }, 5000);

    // Also simulate specific scenarios
    setTimeout(() => this.simulateButtonPress(), 10000);
    setTimeout(() => this.simulateDoorOpen(), 15000);
    setTimeout(() => this.simulateDoorClose(), 20000);
    setTimeout(() => this.simulateLightToggle(), 25000);
  }

  private publishDeviceState(device: SimulatedDevice): void {
    const topic = MqttTopicBuilder.deviceState(ROOM_ID, CONTROLLER_ID, device.device_id);

    const payload = {
      v: 1,
      type: 'device_state',
      controller_id: CONTROLLER_ID,
      device_id: device.device_id,
      state: device.current_state,
      timestamp: new Date().toISOString(),
    };

    this.client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to publish state for ${device.device_id}:`, err);
      } else {
        console.log(`📤 [${device.name}] State: ${JSON.stringify(device.current_state)}`);
      }
    });
  }

  private simulateRandomStateChange(): void {
    const randomDevice = this.devices[Math.floor(Math.random() * this.devices.length)];

    // Randomize state based on device type
    switch (randomDevice.type) {
      case 'button':
        randomDevice.current_state.pressed = Math.random() > 0.5;
        break;
      case 'sensor':
        randomDevice.current_state.open = Math.random() > 0.5;
        break;
      case 'relay':
        randomDevice.current_state.on = Math.random() > 0.5;
        break;
      case 'maglock':
        randomDevice.current_state.locked = Math.random() > 0.3; // Mostly locked
        randomDevice.current_state.power = 11.8 + Math.random() * 0.4; // 11.8-12.2V
        break;
    }

    console.log(`\n🎲 Random state change: ${randomDevice.name}`);
    this.publishDeviceState(randomDevice);
  }

  private simulateButtonPress(): void {
    const button = this.devices.find((d) => d.device_id === 'dev_button_red');
    if (!button) return;

    console.log('\n🔴 Simulating button press sequence...');

    // Press
    button.current_state.pressed = true;
    this.publishDeviceState(button);

    // Release after 500ms
    setTimeout(() => {
      button.current_state.pressed = false;
      this.publishDeviceState(button);
    }, 500);
  }

  private simulateDoorOpen(): void {
    const sensor = this.devices.find((d) => d.device_id === 'dev_sensor_door');
    if (!sensor) return;

    console.log('\n🚪 Simulating door opening...');
    sensor.current_state.open = true;
    this.publishDeviceState(sensor);
  }

  private simulateDoorClose(): void {
    const sensor = this.devices.find((d) => d.device_id === 'dev_sensor_door');
    if (!sensor) return;

    console.log('\n🚪 Simulating door closing...');
    sensor.current_state.open = false;
    this.publishDeviceState(sensor);
  }

  private simulateLightToggle(): void {
    const relay = this.devices.find((d) => d.device_id === 'dev_relay_lights');
    if (!relay) return;

    console.log('\n💡 Simulating light toggle...');
    relay.current_state.on = !relay.current_state.on;
    this.publishDeviceState(relay);
  }

  public stop(): void {
    console.log('\n👋 Stopping device simulator...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.client.end(false, {}, () => {
      console.log('✅ MQTT connection closed');
      process.exit(0);
    });
  }
}

// Start simulator
const simulator = new DeviceSimulator();

// Graceful shutdown
process.on('SIGINT', () => simulator.stop());
process.on('SIGTERM', () => simulator.stop());
