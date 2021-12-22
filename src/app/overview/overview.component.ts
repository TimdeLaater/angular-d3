import { Component, ElementRef, Input, OnInit } from '@angular/core';
import Graph from "graphology";
import { Sigma } from "sigma";
import FA2LayoutSupervisor, {
  FA2LayoutSupervisorParameters
} from "graphology-layout-forceatlas2/worker";
import { v4 as uuid } from "uuid";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { AdjacencyEntry } from 'graphology-types';
import { Coordinates, EdgeDisplayData, NodeDisplayData } from 'sigma/types';
import { stat } from 'fs';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  @Input() graph?: Graph;
  @Input() settings: FA2LayoutSupervisorParameters = {

  };

  public container: any;
  public searchInput: any;
  public searchSuggestions: any;
  public nodeSize: number = 35;
  constructor(private elRef: ElementRef) { }

  ngAfterViewInit() {
    var container = document.getElementById('sigma-container')
    var searchInput = document.getElementById("search-input") as HTMLInputElement;
    var searchSuggestions = document.getElementById("suggestions") as HTMLDataListElement;
    console.log(container);

    console.log('container', container);
    var div = this.elRef.nativeElement.querySelector('sigma-container')
    console.log("hey", div);

  }

  ngOnInit(): void {
    const graph = new Graph();
    this.container = document.getElementById('sigma-container');
    this.searchInput = document.getElementById("search-input") as HTMLInputElement;
    this.searchSuggestions = document.getElementById("suggestions") as HTMLDataListElement;
    console.log(this.elRef.nativeElement);

    console.log("Hey", this.elRef.nativeElement.querySelector('sigma-container'));
    console.log(this.container);
    //#region sigma settings
    // Create a sample graph


    graph.addNode("n1", { x: 0, y: 0, size: this.nodeSize, color: '#FFF', label: 'Programmeren 1' });
    graph.addNode("n2", { x: -5, y: 5, size: this.nodeSize, color: '#FFF', label: 'Databases 1' });
    graph.addNode("n3", { x: 5, y: 5, size: this.nodeSize, color: '#FFF', label: 'SO&A' });
    graph.addNode("n4", { x: 0, y: 10, size: this.nodeSize, color: '#FFF', label: 'Programmeren 2' });
    graph.addEdge("n1", "n2", { size: 5, color: '#999' });
    //graph.addEdge("n2", "n4");
    graph.addEdge("n4", "n3");
    graph.addEdge("n3", "n1");
    graph.nodes().forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / graph.order;
      graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
      graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));
    });


    // Create the spring layout and start it
    const sensibleSettings = forceAtlas2.inferSettings(graph);


    sensibleSettings.slowDown = 1;
    const layout = new FA2LayoutSupervisor(graph, {
      settings: sensibleSettings,
    });
    layout.start();

    // Create the sigma
    const renderer = new Sigma(graph, this.container!);

    // Type and declare internal state:
    interface State {
      hoveredNode?: string;
      searchQuery: string;
      clickedNode?: string;

      // State derived from query:
      selectedNode?: string;
      suggestions?: Set<string>;

      // State derived from hovered node:
      clickedNeighbors?: Set<string>;
      hoveredNeighbors?: Set<string>;
    }
    const state: State = { searchQuery: "" };

    // Feed the datalist autocomplete values:
    this.searchSuggestions.innerHTML = graph
      .nodes()
      .map((node) => `<option value="${graph.getNodeAttribute(node, "label")}"></option>`)
      .join("\n");


    // Actions:
    const setSearchQuery = (query: string) => {
      // var searchInput = this.searchInput;
      state.searchQuery = query;

      if (this.searchInput.value !== query) this.searchInput.value = query;

      if (query) {
        const lcQuery = query.toLowerCase();
        const suggestions = graph
          .nodes()
          .map((n) => ({ id: n, label: graph.getNodeAttribute(n, "label") as string }))
          .filter(({ label }) => label.toLowerCase().includes(lcQuery));

        // If we have a single perfect match, them we remove the suggestions, and
        // we consider the user has selected a node through the datalist
        // autocomplete:
        if (suggestions.length === 1 && suggestions[0].label === query) {
          state.selectedNode = suggestions[0].id;
          state.suggestions = undefined;

          // Move the camera to center it on the selected node:
          const nodePosition = renderer.getNodeDisplayData(state.selectedNode) as Coordinates;
          renderer.getCamera().animate(nodePosition, {
            duration: 500,
          });
        }
        // Else, we display the suggestions list:
        else {
          state.selectedNode = undefined;
          state.suggestions = new Set(suggestions.map(({ id }) => id));
        }
      }
      // If the query is empty, then we reset the selectedNode / suggestions state:
      else {
        state.selectedNode = undefined;
        state.suggestions = undefined;
      }

      // Refresh rendering:
      renderer.refresh();
    }

    ["clickEdge", "doubleClickEdge"].forEach((eventType) =>
      renderer.on(eventType, ({ edge }) => setOnClick("edge")),
      //OnClick
    );
    function setOnClick(node?: string) {
      if (node) {
        state.clickedNode = node;
        state.clickedNeighbors = new Set(graph.neighbors(node))
      }
      else {
        state.clickedNode = undefined;
        state.clickedNeighbors = undefined;
      }
      renderer.refresh();
      console.log("het werkt")
    }



    function setHoveredNode(node?: string) {
      console.log("het werkt wel?")
      if (node) {
        state.hoveredNode = node;
        state.hoveredNeighbors = new Set(graph.neighbors(node));
      } else {
        state.hoveredNode = undefined;
        state.hoveredNeighbors = undefined;
      }

      // Refresh rendering:
      renderer.refresh();
    }

    // Bind search input interactions:
    this.searchInput.addEventListener("input", () => {
      setSearchQuery(this.searchInput.value || "");
    });
    this.searchInput.addEventListener("blur", () => {
      setSearchQuery("");
    });

    // Bind graph interactions:
    renderer.on("enterNode", ({ node }) => {
      setHoveredNode(node);
    });

    renderer.on("leaveNode", () => {
      setHoveredNode(undefined);
    });
    renderer.on("doubleClickNode", ({ node }) => {
      setOnClick(node)
    })
    renderer.on("clickNode", () => {
      setOnClick(undefined)
    })

    // Render nodes accordingly to the internal state:
    // 1. If a node is selected, it is highlighted
    // 2. If there is query, all non-matching nodes are greyed
    // 3. If there is a hovered node, all non-neighbor nodes are greyed

    renderer.setSetting("nodeReducer", (node, data) => {
      const res: Partial<NodeDisplayData> = { ...data };

      if (state.clickedNeighbors && !state.clickedNeighbors.has(node) && state.clickedNode !== node) {
        res.label = "";
        res.color = "#bebebe";
      }
      if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
        res.label = "";
        res.color = "#bebebe";
      }

      if (state.selectedNode === node) {
        res.color = "#ooffoo";
        res.highlighted = true;

      } else if (state.suggestions && !state.suggestions.has(node)) {
        res.label = "";
        res.color = "#bebebe";
      }

      return res;
    });

    // Render edges accordingly to the internal state:
    // 1. If a node is hovered, the edge is hidden if it is not connected to the
    //    node
    // 2. If there is a query, the edge is only visible if it connects two
    //    suggestions
    renderer.setSetting("edgeReducer", (edge, data) => {
      const res: Partial<EdgeDisplayData> = { ...data };

      if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
        res.hidden = true;
      }
      if (state.clickedNode && !graph.hasExtremity(edge, state.clickedNode)) {
        res.hidden = true;
      }

      if (state.suggestions && (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))) {
        res.hidden = true;
      }

      return res;
    });



    // State for drag'n'drop
    let draggedNode: string | any = null;
    let isDragging = false;
    renderer.on("downNode", (e) => {
      isDragging = true;
      draggedNode = e.node;
      graph.setNodeAttribute(draggedNode!, "highlighted", true);
      renderer.getCamera().disable();
    });



    // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
    renderer.getMouseCaptor().on("mousemovebody", (e) => {
      if (!isDragging || !draggedNode) return;

      // Get new position of node
      const pos = renderer.viewportToGraph(e);

      graph.setNodeAttribute(draggedNode, "x", pos.x);
      graph.setNodeAttribute(draggedNode, "y", pos.y);
    });

    // On mouse up, we reset the autoscale and the dragging mode
    renderer.getMouseCaptor().on("mouseup", () => {
      if (draggedNode) {
        graph.removeNodeAttribute(draggedNode, "highlighted");
      }
      isDragging = false;
      draggedNode = null;
      renderer.getCamera().enable();
    });
    renderer.getMouseCaptor().on("mousedown", () => {
      if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
    });



    // // When clicking on the stage, we add a new node and connect it to the closest node
    // renderer.on("clickStage", ({ event }: { event: { x: number; y: number } }) => {
    //   // Sigma (ie. graph) and screen (viewport) coordinates are not the same.
    //   // So we need to translate the screen x & y coordinates to the graph one by calling the sigma helper `viewportToGraph`
    //   const coordForGraph = renderer.viewportToGraph({ x: event.x, y: event.y });

    //   // We create a new node
    //   const node = {
    //     ...coordForGraph,
    //     size: this.nodeSize,
    //     color: 'fff',
    //     label: 'Tesst'
    //   };

    //   // Searching the two closest nodes to auto-create an edge to it
    //   const closestNodes = graph
    //     .nodes()
    //     .map((nodeId) => {
    //       const attrs = graph.getNodeAttributes(nodeId);
    //       const distance = Math.pow(node.x - attrs['x'], 2) + Math.pow(node.y - attrs['y'], 2);
    //       return { nodeId, distance };
    //     })
    //     .sort((a, b) => a.distance - b.distance)
    //     .slice(0, 2);

    //   // We register the new node into graphology instance
    //   const id = uuid();
    //   graph.addNode(id, node);

    //   // We create the edges
    //   closestNodes.forEach((e) => graph.addEdge(id, e.nodeId, { color: '#fff', size: 10 }));
    // });

    //#endregion
  }


}
