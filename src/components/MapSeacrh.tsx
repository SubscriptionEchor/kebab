
import React, { useRef, useState, useEffect } from 'react';
import { config } from '../constants';
const MapSearch = ({ setMarkerPosition, searchText = '', setSearchText }) => {

    const [searchResults, setSearchResults] = useState([]);
    const [loader, setLoader] = useState(false)
    const [localSearch, setLocalSearch] = useState(searchText)
    const searchRef = useRef(null)

    // Add click outside handler

    useEffect(() => {
        if (searchText !== localSearch) {
            setLocalSearch(searchText)
        }
        
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
                setLocalSearch(searchText);
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchText]);

    const handleSearch = async (text) => {
        try {
            if (!text) {
                setLoader(false)
                setSearchResults([])
                return
            }
            setLoader(true)
            const response = await fetch(`${config.OSM_SEARCH_URL}/api?q=${encodeURIComponent(text)}&limit=10`);
            const data = await response.json();
            const formattedResults = data.features.map(feature => ({
                id: feature.properties.osm_id,
                name: feature.properties.name,
                city: feature.properties.city,
                state: feature.properties.state,
                country: feature.properties.country,
                coordinates: feature.geometry.coordinates, // [longitude, latitude]
                type: feature.properties.type,
                street: feature.properties.street
            }));
            setLoader(false)
            setSearchResults(formattedResults);

            // if (data.length > 0) {
            //   const { lat, lon } = data[0];
            //   map.setView([parseFloat(lat), parseFloat(lon)], 13);
            // }
        } catch (error) {
            setLoader(false)
            console.error('Search error:', error);
        }
    };

    const handleLocationSelect = (value) => {
        setMarkerPosition([value?.coordinates[1], value.coordinates[0]])
        setSearchText(value?.name)
        setLocalSearch(value?.name)
        setSearchResults([])
    }

    return (
        <div
            ref={searchRef}
            style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'white',
                padding: '10px',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                zIndex: 1000
            }}>
            <input
                type="text"
                value={localSearch}
                onChange={(e) => {
                    setLocalSearch(e.target.value)
                    handleSearch(e?.target.value)
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
                placeholder="Search location"
                style={{
                    padding: '5px',
                    width: '200px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    zIndex: 1000,
                }}
            />

            {!loader ?
                searchResults.length > 0 && (
                    <div style={{ width: 200, paddingTop: 10, maxHeight: 150, overflowY: 'scroll' }}>
                        {searchResults.map((result, index) => {
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleLocationSelect(result)}
                                    style={{
                                        marginBottom: 20,
                                        width: 160,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>{result.name}</div>
                                    <div style={{ fontSize: 10, fontWeight: 'bold', color: 'grey' }}>
                                        {[
                                            result.street,
                                            result.city,
                                            result.state,
                                            result.country
                                        ].filter(Boolean).join(', ')}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '5px'
                    }}>
                        loading...
                    </div>
                )}
        </div >
    );
};

export default MapSearch;