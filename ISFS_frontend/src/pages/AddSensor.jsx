import { useEffect, useState } from "react";
import api from "../api/axios";

const SENSOR_OPTIONS = [
	{ value: "SOIL_MOISTURE", label: "Soil Moisture" },
	{ value: "SOIL_PH", label: "Soil pH" },
	{ value: "TEMPERATURE", label: "Temperature" },
	{ value: "HUMIDITY", label: "Humidity" },
	{ value: "LIGHT", label: "Light" }
];

export default function AddSensor() {
	const [sensorType, setSensorType] = useState("");
	const [criticalMin, setCriticalMin] = useState("");
	const [criticalMax, setCriticalMax] = useState("");
	const [useDefaults, setUseDefaults] = useState(true);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [items, setItems] = useState([]);

	const fetchMySensors = async () => {
		try {
			// Backend doesn’t have a dedicated list endpoint; reuse thresholds GET (all)
			const res = await api.get("/sensors/thresholds");
			const data = res.data?.thresholds || {};
			const flat = Object.entries(data).map(([type, t]) => ({
				sensorType: type,
				criticalMin: t.critical_min ?? t.criticalMin ?? null,
				criticalMax: t.critical_max ?? t.criticalMax ?? null,
				unit: t.unit || ""
			}));
			setItems(flat);
		} catch (e) {
			console.error("Failed to load thresholds", e);
		}
	};

	useEffect(() => {
		fetchMySensors();
	}, []);

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		setError("");
		try {
			const body = { sensorType };
			if (useDefaults) body.useDefaults = true;
			else {
				if (criticalMin !== "") body.criticalMin = Number(criticalMin);
				if (criticalMax !== "") body.criticalMax = Number(criticalMax);
			}
			const res = await api.put("/sensors/thresholds", body);
			setMessage(res.data?.message || "Saved");
			setSensorType("");
			setCriticalMin("");
			setCriticalMax("");
			setUseDefaults(true);
			fetchMySensors();
		} catch (e) {
			setError(e.response?.data?.message || e.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
				<h1 className="text-2xl font-bold mb-4">Add Sensor</h1>
				<p className="text-sm text-gray-600 mb-6">Create a sensor entry for your account. You can use system defaults or set custom critical thresholds.</p>

				{message && <div className="mb-4 rounded bg-green-50 text-green-700 px-3 py-2">{message}</div>}
				{error && <div className="mb-4 rounded bg-red-50 text-red-700 px-3 py-2">{error}</div>}

				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Sensor Type</label>
						<select
							value={sensorType}
							onChange={(e) => setSensorType(e.target.value)}
							className="w-full border rounded px-3 py-2"
							required
						>
							<option value="" disabled>Select a type</option>
							{SENSOR_OPTIONS.map(o => (
								<option key={o.value} value={o.value}>{o.label}</option>
							))}
						</select>
					</div>

					<div className="flex items-center gap-2">
						<input id="useDefaults" type="checkbox" className="h-4 w-4" checked={useDefaults} onChange={(e) => setUseDefaults(e.target.checked)} />
						<label htmlFor="useDefaults" className="text-sm text-gray-700">Use system defaults</label>
					</div>

					{!useDefaults && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Critical Min</label>
								<input type="number" step="any" value={criticalMin} onChange={(e) => setCriticalMin(e.target.value)} className="w-full border rounded px-3 py-2" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Critical Max</label>
								<input type="number" step="any" value={criticalMax} onChange={(e) => setCriticalMax(e.target.value)} className="w-full border rounded px-3 py-2" />
							</div>
						</div>
					)}

					<div className="pt-2">
						<button type="submit" disabled={loading || !sensorType} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
							{loading ? "Saving..." : "Save Sensor"}
						</button>
					</div>
				</form>
			</div>

			<div className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
				<h2 className="text-xl font-semibold mb-4">My Sensors</h2>
				{items.length === 0 ? (
					<div className="text-gray-500 text-sm">No sensors yet.</div>
				) : (
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-gray-500">
								<th className="py-2">Type</th>
								<th className="py-2">Critical Min</th>
								<th className="py-2">Critical Max</th>
								<th className="py-2">Unit</th>
							</tr>
						</thead>
						<tbody>
							{items.map((it) => (
								<tr key={it.sensorType} className="border-t">
									<td className="py-2">{it.sensorType}</td>
									<td className="py-2">{it.criticalMin ?? "-"}</td>
									<td className="py-2">{it.criticalMax ?? "-"}</td>
									<td className="py-2">{it.unit}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}


