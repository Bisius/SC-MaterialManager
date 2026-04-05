export enum LocationType {
	City = 0,
	Station = 1
}

export interface Location {
	name: string
	system: string
	type: LocationType
	refinery: boolean
}

export const locations: Location[] = [

	// Crusader
	{ name: 'Orison',           system: 'Stanton', type: LocationType.City,    refinery: false },
	{ name: 'Seraphim Station', system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'CRU-L1',           system: 'Stanton', type: LocationType.Station, refinery: true  },
	{ name: 'CRU-L2',           system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'CRU-L3',           system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'CRU-L4',           system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'CRU-L5',           system: 'Stanton', type: LocationType.Station, refinery: false },

	// Microtech
	{ name: 'New Babbage',      system: 'Stanton', type: LocationType.City,    refinery: false },
	{ name: 'Port Tressler',    system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'MIC-L1',           system: 'Stanton', type: LocationType.Station, refinery: true  },
	{ name: 'MIC-L2',           system: 'Stanton', type: LocationType.Station, refinery: true  },
	{ name: 'MIC-L3',           system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'MIC-L4',           system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'MIC-L5',           system: 'Stanton', type: LocationType.Station, refinery: true  },

	// ArcCorp
	{ name: 'Area18',           system: 'Stanton', type: LocationType.City,    refinery: false },
	{ name: 'Baijini Point',    system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'ARC-L1',           system: 'Stanton', type: LocationType.Station, refinery: true  },
	{ name: 'ARC-L2',           system: 'Stanton', type: LocationType.Station, refinery: true  },
	{ name: 'ARC-L3',           system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'ARC-L4',           system: 'Stanton', type: LocationType.Station, refinery: true  },
	{ name: 'ARC-L5',           system: 'Stanton', type: LocationType.Station, refinery: false },

	// Hurston
	{ name: 'Lorville',         system: 'Stanton', type: LocationType.City,    refinery: false },
	{ name: 'Everus Harbor',    system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'HUR-L1',           system: 'Stanton', type: LocationType.Station, refinery: true  },
	{ name: 'HUR-L2',           system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'HUR-L3',           system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'HUR-L4',           system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'HUR-L5',           system: 'Stanton', type: LocationType.Station, refinery: false },

	// Gateways
	{ name: 'Stanton - Nyx Gateway',   system: 'Stanton', type: LocationType.Station, refinery: false },
	{ name: 'Stanton - Pyro Gateway',  system: 'Stanton', type: LocationType.Station, refinery: true  },
	{ name: 'Stanton - Terra Gateway', system: 'Stanton', type: LocationType.Station, refinery: true  },

	// Pyro
	{ name: 'Checkmate',                system: 'Pyro', type: LocationType.Station, refinery: true  },
	{ name: 'Orbituary',                system: 'Pyro', type: LocationType.Station, refinery: true  },
	{ name: 'Ruin Station',             system: 'Pyro', type: LocationType.Station, refinery: true  },
	{ name: 'Megumi Refueling',         system: 'Pyro', type: LocationType.Station, refinery: false },
	{ name: 'Dudley & Daughters',       system: 'Pyro', type: LocationType.Station, refinery: false },
	{ name: 'Endgame',                  system: 'Pyro', type: LocationType.Station, refinery: false },
	{ name: "Rat's Nest",               system: 'Pyro', type: LocationType.Station, refinery: false },
	{ name: "Rod's Fuel'n Suppies",     system: 'Pyro', type: LocationType.Station, refinery: false },
	{ name: 'Starlight Service Station',system: 'Pyro', type: LocationType.Station, refinery: false },
	{ name: 'Patch City',               system: 'Pyro', type: LocationType.Station, refinery: false },

	// Gateways
	{ name: 'Pyro - Stanton Gateway',   system: 'Pyro', type: LocationType.Station, refinery: true  },
	{ name: 'Pyro - Nyx Gateway',       system: 'Pyro', type: LocationType.Station, refinery: false },

	// Nyx
	{ name: 'Levski',                        system: 'Nyx',  type: LocationType.City,    refinery: true  },
	{ name: "People's Service Station Lambda",system: 'Nyx', type: LocationType.Station, refinery: false },
	{ name: "People's Service Station Theta", system: 'Nyx', type: LocationType.Station, refinery: false },
	{ name: "People's Service Station Delta", system: 'Nyx', type: LocationType.Station, refinery: false },
	{ name: "People's Service Station Alpha", system: 'Nyx', type: LocationType.Station, refinery: false },

	// Gateways
	{ name: 'Nyx - Stanton Gateway',         system: 'Nyx', type: LocationType.Station, refinery: true  },
	{ name: 'Nyx - Pyro Gateway',            system: 'Nyx', type: LocationType.Station, refinery: false },

]
