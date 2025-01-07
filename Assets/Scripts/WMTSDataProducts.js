const products = {
  "Mediterranean Sea Waves Reanalysis": {
    /*
      Available datasets
      VPED, VTPK
      VHM0, VHM0_SW1, VHM0_SW2, VHM0_WW
      VMDR, VMDR_SW1, VMDR_SW2, VMDR_WW
      VSDX, VSDY
      VTM01_SW1, VTM01_SW2, VTM01_WW, VTM02
      VTM10
    */
    wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_WAV_006_012/med-hcmr-wav-rean-h_202105?request=GetCapabilities&service=WMS',
    doi: "https://doi.org/10.25423/cmcc/medsea_multiyear_wav_006_012",
    timeScales: ['h'],
    dataSets: ['VHM0', 'VHM0_WW', 'VHM0_SW1', 'VHM0_SW2',
              'VTM02', 'VTM01_WW', 'VTM01_SW1', 'VTM01_SW2',
              'VMDR', 'VMDR_WW', 'VMDR_SW1', 'VMDR_SW2'],
  },
  "Mediterranean Sea Waves Analysis and Forecast": {
    // https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_WAV_006_017?request=GetCapabilities&service=WMS
    /*
    Available datasets
    VCMX, VMXL, VPED, VTPK
    VHM0, VHM0_SW1, VHM0_SW2, VHM0_WW
    VMDR, VMDR_SW1, VMDR_SW2, VMDR_WW
    VSDX, VSDY
    VTM01_SW1, VTM01_SW2 ,VTM01_WW ,VTM02
    VTM10
    */
    wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_WAV_006_017?request=GetCapabilities&service=WMS',
    doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam4',
    timeScales: ['h'],
    dataSets: ['VHM0', 'VHM0_WW', 'VHM0_SW1', 'VHM0_SW2',
              'VTM02', 'VTM01_WW', 'VTM01_SW1', 'VTM01_SW2',
              'VMDR', 'VMDR_WW', 'VMDR_SW1', 'VMDR_SW2'],
  },
  "Mediterranean Sea Physics Reanalysis": {
    /*
    Available datasets 
      sea_water_velocity, uo, vo, wo - Current
      so, - Salinity
      zos - Sea Surface Height
      thetao, bottomT - Potential temperature
    */
    wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_PHY_006_004?request=GetCapabilities&service=WMS',
    doi: 'https://doi.org/10.25423/CMCC/MEDSEA_MULTIYEAR_PHY_006_004_E3R1I',
    timeScales: ['h', 'd', 'm'],
    dataSets: ['sea_water_velocity', 'uo', 'vo', 'wo', 'so', 'thetao', 'bottomT']
  },
  "Mediterranean Sea Physics Analysis and Forecast": {
    /*
    Available datasets 
      sea_water_velocity, uo, vo, wo - Current
      so, - Salinity
      zos - Sea Surface Height
      thetao, bottomT - Potential temperature
    */
    wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_PHY_006_013?request=GetCapabilities&service=WMS',
    doi: 'https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS8',
    timeScales: ['h', 'd', 'm'],
    dataSets: ['sea_water_velocity', 'uo', 'vo', 'wo', 'so', 'thetao', 'bottomT']
  },
  "Mediterranean Sea High Resolution and Ultra High Resolution Sea Surface Temperature Analysis": {
    /*
    Available datasets
      analysed_sst -  Analysed sea surface temperature (analysed_sst)
      analysis_error - Estimated error standard deviation of analysed sst
      mask - Sea/land/lake/ice field composite mask
      sea_ice_fraction - Sea ice area fraction
      sst_anomaly - Sea surface temperature anomaly
    */
    //wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/SST_MED_SST_L4_NRT_OBSERVATIONS_010_004?request=GetCapabilities&service=WMS',
    // There are two products with sst_anomaly, one with 1/16 resolution and the other with 1/100. The following url forces the 1/100
    wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/SST_MED_SST_L4_NRT_OBSERVATIONS_010_004/SST_MED_SSTA_L4_NRT_OBSERVATIONS_010_004_d?request=GetCapabilities&service=WMS',
    doi: 'https://doi.org/10.48670/moi-00172',
    timeScales: ['d'],
    dataSets: ['sst_anomaly']
  },
  "Mediterranean Sea Biogechemistry Reanalysis": {
    /*
    Available datasets 
      nppv, o2 - Primary Production and Oxygen
      dissic, ph, talk - Dissolved Inorganic Carbon, pH and Alkalinity
      fpco2, spco2 - Surface CO2 flux and Surface partial pressure of CO2
      nh4, no3, po4 - Ammonium, Nitrate and Phosphate
      chl, phyc - Phytoplankton Carbon Biomass and Chlorophyll
    */
    wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_BGC_006_008?request=GetCapabilities&service=WMS',
    doi: 'https://doi.org/10.25423/cmcc/medsea_multiyear_bgc_006_008_medbfm3',
    timeScales: ['d', 'm'],
    dataSets: ['chl']
  },
  "Mediterranean Sea Biogechemistry Analysis and Forecast": {
    /*
    Available datasets
      diatoC, diatoChla - Diatoms Carbon Biomass and Diatoms Chlorophyll concentration
      dinoC, dinoChla - Dinoflagellates Carbon Biomass and Dinoflagellates Chlorophyll concentration
      nanoC, nanoChla - Nanophytoplankton Carbon Biomass  and Nanophytoplankton Chlorophyll concentration
      nppv, o2 - Primary Production and Oxygen
      dissic, ph, talk - Dissolved Inorganic Carbon, pH and Alkalinity
      fpco2, spco2 - Surface CO2 flux and Surface partial pressure of CO2
      nh4, no3, po4, si - Ammonium, Nitrate, Phosphate and Silicate
      kd490 - Diffuse attenuation coefficient of the downwelling irradiance at 490 nm
      picoC, picoChla - Picophytoplankton Carbon Biomass and Picophytoplankton Chlorophyll concentration
      zooc - Zooplankton Carbon Biomass
      phyc, chl - Phytoplankton Carbon Biomass,  and Chlorophyll
    */
    wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_BGC_006_014?request=GetCapabilities&service=WMS',
    doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_bgc_006_014_medbfm4',
    timeScales: ['d', 'm'],
    dataSets: ['chl']
  },
};

export default products;