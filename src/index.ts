import { Viewer } from "./Viewer";
import { Configuration } from "./Configuration";
import axios from 'axios';
import { Excursion } from "./Models/Excursion";

document.addEventListener("DOMContentLoaded", async () => {
    var viewer = new Viewer();
    viewer.createScene();
    const response = await axios.get<Excursion>(Configuration.SceneURL);
    if (response.status != 200) {
        console.warn("Can't get scene description");
        return;
    }
    await viewer.show(response.data);
});