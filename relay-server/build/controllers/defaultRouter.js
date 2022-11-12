"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreams = void 0;
const axios_1 = __importDefault(require("axios"));
const express_1 = require("express");
const router = (0, express_1.Router)();
const timeout = 5000;
const servers = (_a = process.env.SERVERS) === null || _a === void 0 ? void 0 : _a.split(',');
if (!servers) {
    console.log("servers env: ", process.env.SERVERS);
    throw "No servers defined";
}
console.log('Setuped with servers: ', servers);
router.get('/streams', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const streams = yield (0, exports.getStreams)(servers);
    return res.json(streams);
}));
const getStreams = (servers) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const streams = [];
        for (const server of servers) {
            const collection = yield getStream(server);
            for (let key in collection.live) {
                const stream = collection.live[key];
                streams.push({
                    server,
                    streamName: key,
                    stream
                });
            }
        }
        return streams;
    }
    catch (_b) {
        return [];
    }
});
exports.getStreams = getStreams;
const getStream = (server) => __awaiter(void 0, void 0, void 0, function* () {
    const url = apiPath(server, "/api/streams");
    const res = yield (0, axios_1.default)({
        method: 'get',
        url,
        timeout
    });
    if (res.status === 200) {
        return res.data;
    }
    throw "Error";
});
const apiPath = (baseUrl, endpoint) => {
    return baseUrl + endpoint;
};
exports.default = router;
