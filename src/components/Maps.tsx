import { useLazyQuery } from "@apollo/client";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { CHECK_ZONE_RESTRICTIONS } from "../lib/graphql/queries/zones";
import { toast } from "sonner";
import { throttle } from "lodash";
import { config } from "../constants";
import { Icon } from "leaflet";
import MapSearch from "./MapSeacrh";
import { ADMIN_DASHBOARD_BOOTSTRAP } from "../lib/graphql/queries/admin";


// Fix for default marker icon
const icon = new Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapsComponentProps {
    position: [number, number];
    setPosition: Dispatch<SetStateAction<[number, number]>>;
    setIsValidZone: Dispatch<SetStateAction<boolean>>;
    searchText?: string;
    setSearchText?: Dispatch<SetStateAction<string>>;
}

export default function MapsComponent({ 
    position, 
    setPosition, 
    setIsValidZone, 
    searchText, 
    setSearchText 
}: MapsComponentProps) {
    const [CHECK_ZONE] = useLazyQuery(CHECK_ZONE_RESTRICTIONS)
    const { t } = useTranslation();

    async function getCoordsDetails(newCoordinates) {
    const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${newCoordinates?.[0]}&lon=${newCoordinates?.[1]}&format=json`
        );
        const data = await response.json();
        if (data && (data?.name || data?.display_name)) {
            if (setSearchText) {
                setSearchText(data?.name || data?.display_name);
            }
        }
    }

    useEffect(() => {
        getCoordsDetails(position)
    }, [position])
    function SetViewOnClick({ coords }: { coords: [number, number] }) {
        const map = useMap();
        useEffect(() => {
            map.setView(coords, map.getZoom());
        }, [coords, map]);
        return null;
    }

    return (
        <div className="h-[400px]">
            <MapSearch searchText={searchText || ''} setSearchText={setSearchText} setMarkerPosition={async (value) => {
                let { data: zoneData, error } = await CHECK_ZONE({
                    variables: {
                        inputValues: {
                            latitude: value[0],
                            longitude: value[1]
                        }
                    },
                });
                if (error) {
                    console.error("Error checking zone:", error)
                    setIsValidZone(false);
                    return
                }
                if (!zoneData?.checkZoneRestrictions?.selectedZone) {
                  toast.error(t("location.outsideServiceFallback"));
                    setIsValidZone(false);
                    setPosition([position[0], position[1]]);
                    getCoordsDetails(position)
                    return
                }
                toast.success(t("location.activedelivery"));
                setIsValidZone(true);
                setPosition(value)
            }} />
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer url={config.TILE_URL} attribution="Kebab Maps" />
                <Marker
                    position={position}
                    icon={icon}
                    draggable={true}
                />
                <SetViewOnClick coords={position} />
            </MapContainer>
        </div>
    )
}
