import { createCustomElement, actionTypes } from "@servicenow/ui-core";
import snabbdom from "@servicenow/ui-renderer-snabbdom";
import styles from "./styles.scss";

const {COMPONENT_BOOTSTRAPPED, COMPONENT_DOM_READY  } = actionTypes;

var map_markers = [];
var map;

const view = (state, { updateState, dispatch }) => {

	var markers = state.properties.markers;

	const handleClick = async (event,current) => {
		await updateState({ 
			showList: !state.showList,
		});

		if (!state.showList){
			map_markers.forEach(marker => {marker.map = map });
		}
		else {
			map_markers.forEach(marker => {marker.map = null });
		}
	};

	return (
		<div className="parent_div">
			<div id="map"> Loadin google maps..</div>
			<label className="switch">
				Zoom : {state.properties.initialZoomLevel} | 
				Show Markers on Map
				<input type="checkbox" on-click={(e)=>handleClick(e,state.showList)} checked={state.showList} />
				<span className="slider"></span>
			</label>
		</div>

		
	);
};

createCustomElement("x-904640-blue-box-component-experiment", {
	setInitialState({host, properties, context}) {
        return {
            showList: true,
			tempVar : "One"
        };
    },
	properties: {
		label: {
			schema: { type: "string" },
			default: "",
		},
		markers : {
			schema : {
				"type":"array",
				"items": {
					"type":"object",
					"properties": {
						"category":{
							"type":"string"
						},
						"lattitude":{
							"type":"number"
						},
						"longitude":{
							"type":"number"
						},
						"label":{
							"type":"string"
						}
					}
				}

			  },
			default : [
				{
					lattitude : 26.93539,
					longitude : 75.86563,
					label : "Jaipur"
				},
				{
					lattitude : 26.93739,
					longitude : 75.86763,
					label : "Other"
				}

			]
		},
		initialCoordinates: {
			"schema" : "object",
			"properties" :{
					"lattitude":{
						"type":"number"
					},
					"longitude":{
						"type:":"number"
					}
			},
			"default": {
				lattitude : 26.93739,
				longitude : 75.86763
			}
		},
		initialZoomLevel: {
			"schema":{"type":"number"},
			"default":14
		},
		googleApiKey : {
			"schema":{"type":"string"},
			"default":"Google API Key"
		}
	},
	renderer: { type: snabbdom },
	view,
	styles,
	dispatches: {
		PROPERTY_CHANGED: { schema: { type: "object" } },
	},
	actionHandlers : {
		[COMPONENT_DOM_READY ] : async  (state)=>{
			const {host} = state;
			const {properties} = state;
			const parent_container = host.shadowRoot.querySelector("div.parent_div");
			(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
				key: properties.googleApiKey,
				v: "weekly",
			});

			const positions = state.properties.markers.map(marker => ({
				lat : marker.lattitude,
				lng : marker.longitude,
				label : marker.label??""
			}));

			const { Map, InfoWindow } = await google.maps.importLibrary("maps");
			const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

			map = new Map(parent_container.querySelector("#map"), {
				zoom: state.properties.initialZoomLevel,
				center: {
					lat : state.properties.initialCoordinates.lattitude,
					lng : state.properties.initialCoordinates.longitude
				},
				mapId: "loop91_google_map",
			});

			

			positions.forEach(position => {

				
				// adding marker onto map
				const marker = new AdvancedMarkerElement({
					map: state.state.showList?map:null,
					position: position,
					title:position.label,
					gmpClickable : position.label.length > 0
				});

				map_markers.push(marker);

				if (position.label.length > 0){
					// adding infowindow for marker
					const info_win = new InfoWindow({
						content : position.label,
						ariaLabel : position.label
					});
					
					// connecting marker and infowindow
					marker.addListener("gmp-click",()=>{
						info_win.open({
							anchor : marker,
							map:map
						});
					});

				}
			});
			
		}
	}
});
