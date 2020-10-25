import dataStore from 'nedb-promise';

export class PlantStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(plant) {
    let plantName = plant.name;
    if (!plantName) { // validation
      throw new Error('Missing name property')
    }
    return this.store.insert(plant);
  };
  
  async update(props, plant) {
    return this.store.update(props, plant);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new PlantStore({ filename: './db/plants.json', autoload: true });