// One could use standard dictionaries / vocabularies?
// These are useful for the interface, UI
const customDefinitions = {
  'VHM0': {
    shortName: 'Wave height',
    altNames: ['Hs', 'Hm0', 'Wave significant height', 'Spectral significant wave height (Hm0)'],
    range: [0,12],
    animation: {
      layerNames: ['VHM0', 'VMDR'], // Intensity, Angle
      format: 'value_angle',
      type: 'wave'
    },
  },
  'VTM02': {
    shortName: 'Wave period',
    range: [0, 18],
  },
  'VTM01_WW': {
    shortName: 'Wave period',
    range: [0, 18],
  },
  'VTM01_SW1': {
    shortName: 'Wave period',
    range: [0, 18],
  },
  'VTM01_SW2': {
    shortName: 'Wave period',
    range: [0, 18],
  },
  'VHM0_WW': {// Wind wave height
    shortName: 'Wind wave height',
    altNames: ['Wind wave significant height', "Spectral significant wind wave height", 'Wind waves', 'WWSH'],
    range: [0,12],
    animation: {
      layerNames: ['VHM0_WW', 'VMDR_WW'], // Intensity, Angle
      format: 'value_angle',
      type: 'whiteWave'
    },
  },
  'VMDR': {
    shortName: 'Wave direction',
    altNames: ['Mean wave direction', 'MDIR'],
    unit: 'º',
    range: [0, 360],
  },

  'VHM0_SW1': { // Swell 1 wave height
    range: [0, 12],
    altNames: ["Primary swell wave significant height"],
    animation: {
      layerNames: ['VHM0_SW1', 'VMDR_SW1'], // Intensity, Angle
      format: 'value_angle',
      type: 'wave'
    },
  },
  'VHM0_SW2': { // Swell 2 wave height
    range: [0, 12],
    altNames: ["Secondary swell wave significant height"],
    animation: {
      layerNames: ['VHM0_SW2', 'VMDR_SW2'], // Intensity, Angle
      format: 'value_angle',
      type: 'wave'
    },
  },
  'uo': {
    range: [0, 2.5],
    unit: 'm/s',
  },
  'vo': {
    range: [0, 2.5],
    unit: 'm/s',
  },
  'wo': {
    range: [0, 1.5],
    unit: 'm/s',
  },
  'thetao': {
    shortName: 'Surface temperature',
    altNames: ['Sea surface temperature', 'SST'],
    range: [2, 38],
    unit: 'ºC',
    // Styles
    // Legends from Assets/Legends
    legends: ['Occam', 'Alg2', 'Inferno', 'OccamPastel', 'Zebra'],
    legendRanges: [
      [11, 30],
      [17, 30],
      [10, 20],
      [2, 35],
    ],
  },
  'bottomT': {
    range: [2, 38],
    shortName: 'Bottom temperature',
    altNames: ['Sea bottom temperature'],
    unit: 'ºC'
  },
  'sst_anomaly': {
    range: [-8, 8],
    shortName: 'Sea surface temperature anomaly',
    altNames: ['Sea temperature anomaly', 'Temperature anomaly'],
    unit: 'ºC'
  },
  'so': {
    shortName: 'Salinity',
    range: [32, 41],
    unit: '‰',
  },
  'chl': {
    shortName: 'Chlorophyll',
    range: [0.01, 0.3],
    unit: 'mg/m³',
  }
}

export default customDefinitions;