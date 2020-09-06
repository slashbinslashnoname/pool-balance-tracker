const axios = require("axios");
var Table = require("terminal-table");

const pools = [
	{
		name: "ethermine",
		coins: [
			{ name: "eth", url: "https://api.ethermine.org" },
			{ name: "etc", url: "https://api-etc.ethermine.org" },
		],
		endpoint: "/miner/{minerId}/currentStats",
	},
	{
		name: "cruxpool",
		coins: [
			{ name: "eth", url: "https://www.cruxpool.com/api/eth" },
			{ name: "etc", url: "https://www.cruxpool.com/api/etc" },
		],
		endpoint: "/miner/{minerId}/balance",
	},
];

const coins = [
	{ name: "eth", address: "0x7e1A1fA127cB744ae6AD29a7622eB3e197cFb928" },
	{ name: "etc", address: "0xEA441FeAF2F082b0993108fDFCE07356b34379AE" },
];
var customConfig = {
	showMillis: false,
	showTimestamp: false,
	info: "blue",
	error: ["bgRed", "bold"],
	debug: "rainbow",
};
const start = async () => {
	console.clear();
	console.log("COINCHECKER (c) Slashbinslashnoname");
	console.log(`===================================`);
	console.log();

	let apis = [];

	coins.map((coin) => {
		pools.map((pool) => {
			pool.coins
				.filter((poolCoin) => poolCoin.name === coin.name)
				.map((p) => {
					apis.push({
						poolName: pool.name,
						coin: p.name,
						address: coin.address,
						url: p.url + pool.endpoint.replace("{minerId}", coin.address),
					});
				});
		});
	});

	apis = apis.sort((a, b) => {
		return a.poolName.localeCompare(b.poolName);
	});

	var t = new Table({
		width: [10, "10", "50", "30"],
	});
	t.insertRow(0, ["Platform", "Coin", "Address", "Balance"]);
	t.insertRow(1, ["------", "------", "------", "------"]);
	let i = 2;

	getData(apis).then((datas) => {
		datas.forEach((data) => {
			t.insertRow(i, data);
			i++;
		});
		console.log("" + t);
	});
};

const getData = async (apis) => {
	data = [];
	for (let index = 0; index < apis.length; index++) {
		await axios.get(apis[index].url).then((res) => {
			data.push([
				apis[index].poolName,
				apis[index].coin,
				apis[index].address.toLowerCase(),
				filterBalance(apis[index].poolName, res.data.data),
			]);
		});
	}
	return data;
};

const filterBalance = (name, data) => {
	switch (name) {
		case "cruxpool":
			return (data.balance / 1e9).toFixed(6);
		case "ethermine":
			return ((data.unpaid + data.unconfirmed) / 1e18).toFixed(5);
	}
};
start();
setInterval(start, 120000);
