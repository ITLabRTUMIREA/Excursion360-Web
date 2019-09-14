import { TransformNode, Vector3, Scene, MeshBuilder, Material, AbstractMesh, ActionManager, ExecuteCodeAction } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export class LinkToState {
    private static linkmodel: AbstractMesh;
    private static snubCuboctahedron = {
        name: "Snub Cuboctahedron",
        category: ["Archimedean Solid"],
        // tslint:disable-next-line: max-line-length
        vertex: [[0, 0, 1.077364], [0.7442063, 0, 0.7790187], [0.3123013, 0.6755079, 0.7790187], [-0.482096, 0.5669449, 0.7790187], [-0.7169181, -0.1996786, 0.7790187], [-0.1196038, -0.7345325, 0.7790187], [0.6246025, -0.7345325, 0.4806734], [1.056508, -0.1996786, 0.06806912], [0.8867128, 0.5669449, 0.2302762], [0.2621103, 1.042774, 0.06806912], [-0.532287, 0.9342111, 0.06806912], [-1.006317, 0.3082417, 0.2302762], [-0.7020817, -0.784071, 0.2302762], [0.02728827, -1.074865, 0.06806912], [0.6667271, -0.784071, -0.3184664], [0.8216855, -0.09111555, -0.6908285], [0.6518908, 0.6755079, -0.5286215], [-0.1196038, 0.8751866, -0.6168117], [-0.8092336, 0.4758293, -0.5286215], [-0.9914803, -0.2761507, -0.3184664], [-0.4467414, -0.825648, -0.5286215], [0.1926974, -0.5348539, -0.915157], [0.1846311, 0.2587032, -1.029416], [-0.5049987, -0.1406541, -0.9412258]],
        // tslint:disable-next-line: max-line-length
        face: [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 5], [1, 6, 7], [1, 7, 8], [1, 8, 2], [2, 8, 9], [3, 10, 11], [3, 11, 4], [4, 12, 5], [5, 12, 13], [5, 13, 6], [6, 13, 14], [6, 14, 7], [7, 14, 15], [8, 16, 9], [9, 16, 17], [9, 17, 10], [10, 17, 18], [10, 18, 11], [11, 18, 19], [12, 19, 20], [12, 20, 13], [14, 21, 15], [15, 21, 22], [15, 22, 16], [16, 22, 17], [18, 23, 19], [19, 23, 20], [20, 23, 21], [21, 23, 22], [0, 5, 6, 1], [2, 9, 10, 3], [4, 11, 19, 12], [7, 15, 16, 8], [13, 20, 21, 14], [17, 22, 23, 18]]
    };

    private center: TransformNode;
    private linkObject: AbstractMesh;
    private guiMesh: AbstractMesh;
    private guiTexture: AdvancedDynamicTexture;
    private textBlock: TextBlock;

    constructor(
        public name: string,
        position: Vector3,
        material: Material,
        triggered: () => Promise<void>,
        private scene: Scene) {
        this.center = new TransformNode(name, scene);
        this.center.position = position;

        if (!LinkToState.linkmodel) {
            LinkToState.linkmodel = MeshBuilder.CreatePolyhedron(`link_to_state_polyhedron`,
                {
                    custom: LinkToState.snubCuboctahedron,
                    size: 0.5
                }, scene).convertToFlatShadedMesh();
            LinkToState.linkmodel.position.y = -100;
        }

        this.linkObject = LinkToState.linkmodel.clone(`l${name}_polyhedron`, this.center);
        this.linkObject.position = Vector3.Zero();
        this.linkObject.material = material;
        this.linkObject.actionManager = new ActionManager(this.scene);
        this.linkObject.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, async (ev) => {
            await triggered();
        }));
        this.linkObject.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, (ev) => {
                this.guiMesh.isVisible = true;
            }));
        this.linkObject.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, (ev) => {
                this.guiMesh.isVisible = false;
            }));

        this.guiMesh = MeshBuilder.CreatePlane(name, { size: 20 }, scene);
        this.guiMesh.parent = this.center;
        this.guiMesh.position.y += 1.5;
        this.guiMesh.lookAt(this.center.position.scale(1.1));
        this.guiMesh.isVisible = false;

        this.guiTexture = AdvancedDynamicTexture.CreateForMesh(this.guiMesh);
        this.textBlock = new TextBlock(`${name}_text_block`, name);
        this.textBlock.fontSize = 50;
        this.textBlock.color = "white";
        this.textBlock.text = name;
        this.textBlock.shadowOffsetX = 1;
        this.textBlock.shadowOffsetY = 1;
        this.guiTexture.addControl(this.textBlock);
    }

    public rotate(axis: Vector3, angle: number): void {
        this.linkObject.rotate(axis, angle);
    }

    public dispose(): void {
        this.textBlock.dispose();
        this.guiTexture.dispose();
        this.guiMesh.dispose();
        this.linkObject.dispose();
        this.center.dispose();
    }
}
