import React, { useState, useRef } from "react";
import axios from "axios";
import {
    GoogleMap,
    useLoadScript,
    Marker,
    InfoWindow,
} from "@react-google-maps/api";
import "./App.css";

const mapContainerStyle = {
    width: "70vw",
    height: "50vh",
};

function App() {
    const [query, setQuery] = useState("");
    const [temp, setTemp] = useState("");
    const [currentStatus, setcurrentStatus] = useState("");
    const [lat, setLat] = useState(32.715736);
    const [lng, setLng] = useState(-117.161087);
    const [libraries] = useState(["places"]);
    const [markers, setMarkers] = useState([]);
    const [selected, setSelected] = useState(null);

    const center = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
    };

    const onMapClick = React.useCallback(
        (e) =>
            setMarkers((currentState) => [
                ...currentState,
                {
                    // Adding new markers on click
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                    time: new Date(),
                },
            ]),
        []
    );

    const mapRef = useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
    }, []);

    const search = (e) => {
        e.preventDefault();
        axios
            .get(
                `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&APPID=${process.env.REACT_APP_OPEN_WEATHER_KEY}`
            )
            .then((response) => {
                setLat(response.data.coord.lat);
                setLng(response.data.coord.lon);
                setTemp(response.data.main.temp);
                setcurrentStatus(response.data.weather[0].main);
                console.log(response.data.weather[0].main);
                setQuery("");
            })
            .catch(function (error) {
                console.log(error);
                setQuery("");
            });
    };

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    if (loadError) return "Error loading maps";
    if (!isLoaded) return "Loading Maps";

    return (
        <div className="map">
			{ currentStatus ? 
			<div>
	            <p className="top">Temperature: {((temp * 9) / 5 + 32).toFixed(2)}&#8457; </p>
				<p className="top">Currently: {currentStatus}</p>
			</div>
			:
			null
			}
            <h1 className="h1">Search for the weather by location:</h1>

            <form onSubmit={search}>
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search any city"
                    onChange={(e) => setQuery(e.target.value)}
                    value={query}
                />
                <input type="submit" value="submit" placeholder="submit" />
            </form>
            <br />
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={10}
                center={center}
                onClick={onMapClick}
                onLoad={onMapLoad}
            >
                {markers.map((x) => (
                    <Marker
                        key={x.time.toISOString()}
                        position={{ lat: x.lat, lng: x.lng }}
                        onClick={() => setSelected(x)}
                    />
                ))}

                {selected ? (
                    <InfoWindow
                        position={{ lat: selected.lat, lng: selected.lng }}
                        onCloseClick={() => setSelected(null)}
                    >
                        <div>
                            <h2>New Location</h2>
                            <p>
                                Latitude: {selected.lat}, Longitude:{" "}
                                {selected.lng}
                            </p>
                        </div>
                    </InfoWindow>
                ) : null}
            </GoogleMap>
        </div>
    );
}

export default App;
