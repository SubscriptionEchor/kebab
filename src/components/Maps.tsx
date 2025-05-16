import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { CHECK_ZONE_RESTRICTIONS } from "../lib/graphql/queries/zones";
import { toast } from "sonner";
import { throttle } from "lodash";
import { config } from "../constants";
import { Icon } from "leaflet";
import MapSearch from "./MapSeacrh";

import { ADMIN_DASHBOARD_BOOTSTRAP } from "../lib/graphql/queries/admin";


interface DraggableMarkerProps {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  setIsValidZone: (valid: boolean) => void;
}

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

export default function MapsComponent({
  position,
  setPosition,
  setIsValidZone,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  setIsValidZone: (valid: boolean) => void;
}) {
  const { t } = useTranslation();
  const [CHECK_ZONE] = useLazyQuery(CHECK_ZONE_RESTRICTIONS);
  const [searchText, setSearchText] = useState("");

    async function getCoordsDetails(newCoordinates) {
    const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${newCoordinates?.[0]}&lon=${newCoordinates?.[1]}&format=json`
    );
    const data = await response.json();
    if (data && (data.name || data.display_name)) {
      setSearchText(data.name || data.display_name);
    }
  }

  useEffect(() => {
    getCoordsDetails(position);
  }, [position]);

  function SetViewOnClick({
    coords,
  }: {
    coords: [number, number];
  }) {
    const map = useMap();
    useEffect(() => {
      map.setView(coords, map.getZoom());
    }, [coords, map]);
    return null;
  }

  function DraggableMarker({
    position,
    setPosition,
    setIsValidZone,
  }: DraggableMarkerProps) {
    const { t } = useTranslation();
    const [checkZoneRestrictions] = useLazyQuery(
      CHECK_ZONE_RESTRICTIONS,
      {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
          const { selectedZone, fallbackZone } =
            data.checkZoneRestrictions;
          const isValid = Boolean(selectedZone);
          setIsValidZone(isValid);
          if (!isValid) {
            if (fallbackZone) {
              toast.error(t("location.fallbackzone"), {
                description: t("location.fallbackdescription"),
              });
            } else {
              toast.error(t("location.outsidezones"), {
                description: t(
                  "location.outsidezonesdescription"
                ),
              });
            }
            return;
          }
          toast.success(t("location.activedelivery"));
        },
            onError: (error) => {
                console.error('Failed to check zone restrictions:', error);
                toast.error(t('location.failedtovalidatelocation'));
          setIsValidZone(false);
        },
      }
    );

    const validateZone = throttle(
      async (lat: number, lng: number) => {
        try {
          const { data } = await checkZoneRestrictions({
            variables: {
              inputValues: { latitude: lat, longitude: lng },
            },
          });
          return data?.checkZoneRestrictions?.selectedZone;
            } catch (error) {
                console.error('Failed to check zone restrictions:', error);
                toast.error(t('location.failedtovalidatelocation'));
          return false;
        }
      },
      1000
    );

    const eventHandlers = {
      async dragend(e: any) {
        const marker = e.target;
        const newPos = marker.getLatLng();
        const isValid = await validateZone(
          newPos.lat,
          newPos.lng
        );
        setIsValidZone(Boolean(isValid));
        if (isValid) {
          setPosition([newPos.lat, newPos.lng]);
          getCoordsDetails([newPos.lat, newPos.lng]);
        } else {
          setPosition([...position]);
        }
      },
    };

    return (
      <Marker
        position={position}
        icon={icon}
                draggable={true}
        eventHandlers={eventHandlers}
            // eventHandlers={{
            //   dragend: async (e) => {
            //     const newLatLng = e.target.getLatLng();


            //   }
            // }}
            >
                {/* <Popup>
              <div className="text-sm">
                <p className="font-medium">{t('location.title')}</p>
                <p className="text-gray-500">{t('location.latitude')}</p>
              </div>
            </Popup> */}
            </Marker>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      <MapSearch
        searchText={searchText}
        setSearchText={setSearchText}
        setMarkerPosition={async (value) => {
          const { data: zoneData, error } = await CHECK_ZONE({
            variables: {
              inputValues: {
                latitude: value[0],
                longitude: value[1],
              },
            },
          });
                if (error) {
                    console.log("error", error[0]?.message)
                    return
                }
                if (!zoneData?.checkZoneRestrictions?.selectedZone) {
                    toast.error(t("location.outsideServiceFallback"));
            setPosition([position[0], position[1]]);
            getCoordsDetails(position);
            return;
          }
          toast.success(t("location.activedelivery"));
          setPosition(value);
        }}
      />
      <div className="h-[600px]">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            url={config.TILE_URL}
            attribution={t("location.mapAttribution")}
          />
          <DraggableMarker
            position={position}
            setPosition={setPosition}
            setIsValidZone={setIsValidZone}
          />
          <SetViewOnClick coords={position} />
        </MapContainer>
      </div>
    </div>
  );
}
