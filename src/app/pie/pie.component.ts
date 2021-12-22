import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.css']
})
export class PieComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // // State for drag'n'drop
    // let draggedNode: string | null = null;
    // let isDragging = false;

    // // On mouse down on a node
    // //  - we enable the drag mode
    // //  - save in the dragged node in the state
    // //  - highlight the node
    // //  - disable the camera so its state is not updated
    // renderer.on("downNode", (e) => {
    //   isDragging = true;
    //   draggedNode = e.node;
    //   graph.setNodeAttribute(draggedNode, "highlighted", true);
    //   renderer.getCamera().disable();
    // });

    // // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
    // renderer.getMouseCaptor().on("mousemovebody", (e) => {
    //   if (!isDragging || !draggedNode) return;

    //   // Get new position of node
    //   const pos = renderer.viewportToGraph(e);

    //   graph.setNodeAttribute(draggedNode, "x", pos.x);
    //   graph.setNodeAttribute(draggedNode, "y", pos.y);
    // });

    // // On mouse up, we reset the autoscale and the dragging mode
    // renderer.getMouseCaptor().on("mouseup", () => {
    //   if (draggedNode) {
    //     graph.removeNodeAttribute(draggedNode, "highlighted");
    //   }
    //   isDragging = false;
    //   draggedNode = null;
    //   renderer.getCamera().enable();
    // });

    // // Disable the autoscale at the first down interaction
    // renderer.getMouseCaptor().on("mousedown", () => {
    //   if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
    // });

    // //
    // // Create node (and edge) by click
    // // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // //

    // // When clicking on the stage, we add a new node and connect it to the closest node
    // renderer.on("clickStage", ({ event }: { event: { x: number; y: number } }) => {
    //   // Sigma (ie. graph) and screen (viewport) coordinates are not the same.
    //   // So we need to translate the screen x & y coordinates to the graph one by calling the sigma helper `viewportToGraph`
    //   const coordForGraph = renderer.viewportToGraph({ x: event.x, y: event.y });

    //   // We create a new node
    //   const node = {
    //     ...coordForGraph,
    //     size: 10,
    //   };

    //   // Searching the two closest nodes to auto-create an edge to it
    //   const closestNodes = graph
    //     .nodes()
    //     .map((nodeId) => {
    //       const attrs = graph.getNodeAttributes(nodeId);
    //       const distance = Math.pow(node.x - attrs.x, 2) + Math.pow(node.y - attrs.y, 2);
    //       return { nodeId, distance };
    //     })
    //     .sort((a, b) => a.distance - b.distance)
    //     .slice(0, 2);

    //   // We register the new node into graphology instance
    //   const id = uuid();
    //   graph.addNode(id, node);

    //   // We create the edges
    //   closestNodes.forEach((e) => graph.addEdge(id, e.nodeId));
    // });




  }

}
function uuid() {
  throw new Error('Function not implemented.');
}

