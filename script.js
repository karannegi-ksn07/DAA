const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const array = [];
let barWidth = 20;
let animationSpeed = 250;
let arraySize = 25;
let isPaused = false;
let isStopped = false;
let currentAlgorithm = null;
let abortController = null;
let currentCategory = 'sorting'; // Add current category state

// Graph data structures
let graph = {
  nodes: [],
  edges: [],
  adjacencyList: {}
};
let nodeRadius = 25; // Increased for better visibility
let isGraphMode = false;

// Greedy algorithm data structures
let huffmanTree = null;
let knapsackItems = [];

// Algorithm complexity information
const complexityInfo = {
  bubble: {
    name: 'Bubble Sort',
    time: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)'
    },
    space: 'O(1)'
  },
  selection: {
    name: 'Selection Sort',
    time: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)'
    },
    space: 'O(1)'
  },
  insertion: {
    name: 'Insertion Sort',
    time: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)'
    },
    space: 'O(1)'
  },
  merge: {
    name: 'Merge Sort',
    time: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)'
    },
    space: 'O(n)'
  },
  quick: {
    name: 'Quick Sort',
    time: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)'
    },
    space: 'O(log n)'
  },
  linear: {
    name: 'Linear Search',
    time: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)'
    },
    space: 'O(1)'
  },
  binary: {
    name: 'Binary Search',
    time: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)'
    },
    space: 'O(1)'
  },
  bfs: {
    name: 'Breadth-First Search',
    time: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)'
    },
    space: 'O(V)'
  },
  dfs: {
    name: 'Depth-First Search',
    time: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)'
    },
    space: 'O(V)'
  },
  huffman: {
    name: 'Huffman Coding',
    time: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)'
    },
    space: 'O(n)'
  },
  knapsack: {
    name: 'Fractional Knapsack',
    time: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)'
    },
    space: 'O(n)'
  }
};

// Generate or reset a random array
function resetArray() {
  array.length = 0;
  barWidth = canvas.width / arraySize;
  const maxHeight = canvas.height - 40; // Reduce max height to account for padding
  for (let i = 0; i < arraySize; i++) {
    array.push(Math.random() * maxHeight);
  }
  drawArray();
}

// Draw the array as bars with values
function drawArray(highlight = [], highlightColor = 'blue') {
  const topPadding = 30; // Add padding for the values above bars
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  array.forEach((height, index) => {
    // Draw bar
    ctx.fillStyle = highlight.includes(index) ? highlightColor : 'white';
    ctx.fillRect(index * barWidth, canvas.height - height, barWidth, height);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(index * barWidth, canvas.height - height, barWidth, height);
    
    // Draw value above the bar
    const value = Math.round(height);
    const text = value.toString();
    
    // Calculate text size and position
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';  // Align text to bottom for positioning above bars
    
    // Draw text above the bar
    ctx.fillStyle = 'white';
    const textX = index * barWidth + barWidth/2;
    const textY = canvas.height - height - 5;  // 5px gap between bar and text
    ctx.fillText(text, textX, textY);
  });
}

// Playback controls
function pauseSort() {
  isPaused = !isPaused;
  const pauseBtn = document.getElementById('pauseBtn');
  pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  document.getElementById('stopBtn').disabled = isPaused;
  if (!isPaused) {
    document.getElementById('stopBtn').disabled = false;
  }
}

function stopSort() {
  isStopped = true;
  isPaused = false;
  if (abortController) {
    abortController.abort();
  }
  
  // Handle reset based on current category
  if (currentCategory === 'graph') {
    graph.nodes.forEach(node => node.color = 'white');
    drawGraph();
  } else if (currentCategory === 'greedy') {
    // Clear canvas for greedy algorithms
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Optionally, reset the controls to default state or show initial message
    // For now, just clear the canvas
  } else { // sorting or searching
    resetArray();
  }

  document.getElementById('pauseBtn').textContent = 'Pause';
  document.getElementById('stopBtn').disabled = false;
}

// Modified sleep function to handle pause/stop
async function sleep(ms) {
  if (isStopped) {
    throw new Error('Sorting stopped');
  }
  
  let elapsed = 0;
  while (elapsed < ms) {
    if (isStopped) {
      throw new Error('Sorting stopped');
    }
    
    if (isPaused) {
      await new Promise(resolve => {
        const checkPause = () => {
          if (!isPaused) {
            resolve();
          } else {
            setTimeout(checkPause, 100);
          }
        };
        checkPause();
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 10));
    elapsed += 10;
  }
}

// Bubble Sort
async function bubbleSort() {
    abortController = new AbortController();
    try {
        for (let i = 0; i < array.length - 1; i++) {
            for (let j = 0; j < array.length - i - 1; j++) {
                if (isStopped) return;
                
                // Highlight the bars being compared
                drawArray([j, j + 1], 'blue');
                await sleep(animationSpeed);

                if (array[j] > array[j + 1]) {
                    // Swap the elements
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    // Redraw after swap
                    drawArray([j, j + 1], 'green');
                    await sleep(animationSpeed);
                }
            }
        }
        // Final draw to show sorted array
        drawArray([], 'green');
    } catch (error) {
        if (error.message !== 'Sorting stopped') {
            console.error(error);
        }
    }
}

// Selection Sort
async function selectionSort() {
    abortController = new AbortController();
    try {
        for (let i = 0; i < array.length - 1; i++) {
            let minIndex = i;
            
            // Find minimum element in unsorted array
            for (let j = i + 1; j < array.length; j++) {
                if (isStopped) return;
                
                // Highlight current comparison
                drawArray([minIndex, j], 'blue');
                await sleep(animationSpeed);

                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }

            // Swap if minimum element is not at current position
            if (minIndex !== i) {
                [array[i], array[minIndex]] = [array[minIndex], array[i]];
                drawArray([i, minIndex], 'green');
                await sleep(animationSpeed);
            }
        }
        // Final draw to show sorted array
        drawArray([], 'green');
    } catch (error) {
        if (error.message !== 'Sorting stopped') {
            console.error(error);
        }
    }
}

// Insertion Sort
async function insertionSort() {
    abortController = new AbortController();
    try {
        for (let i = 1; i < array.length; i++) {
            let key = array[i];
            let j = i - 1;

            // Highlight the current element being inserted
            drawArray([i], 'blue');
            await sleep(animationSpeed);

            while (j >= 0 && array[j] > key) {
                if (isStopped) return;
                
                // Move elements greater than key one position ahead
                array[j + 1] = array[j];
                j--;
                
                // Highlight the shifting elements
                drawArray([j + 1, j + 2], 'green');
                await sleep(animationSpeed);
            }
            
            array[j + 1] = key;
            // Show the final position of the inserted element
            drawArray([j + 1], 'green');
            await sleep(animationSpeed);
        }
        // Final draw to show sorted array
        drawArray([], 'green');
    } catch (error) {
        if (error.message !== 'Sorting stopped') {
            console.error(error);
        }
    }
}

// Merge Sort
async function mergeSort(start = 0, end = array.length - 1) {
    if (isStopped) return;
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);
    
    // Highlight the current subarray being processed
    drawArray(Array.from({length: end - start + 1}, (_, i) => start + i), 'blue');
    await sleep(animationSpeed);

    await mergeSort(start, mid);
    await mergeSort(mid + 1, end);
    await merge(start, mid, end);
}

async function merge(start, mid, end) {
    if (isStopped) return;
    
    const left = array.slice(start, mid + 1);
    const right = array.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
        if (isStopped) return;
        
        // Highlight the elements being compared
        drawArray([start + i, mid + 1 + j], 'blue');
        await sleep(animationSpeed);

        if (left[i] <= right[j]) {
            array[k] = left[i];
            i++;
        } else {
            array[k] = right[j];
            j++;
        }
        k++;
        
        // Show the merged result
        drawArray([k - 1], 'green');
        await sleep(animationSpeed);
    }

    // Copy remaining elements
    while (i < left.length) {
        if (isStopped) return;
        array[k] = left[i];
        drawArray([k], 'green');
        await sleep(animationSpeed);
        i++;
        k++;
    }

    while (j < right.length) {
        if (isStopped) return;
        array[k] = right[j];
        drawArray([k], 'green');
        await sleep(animationSpeed);
        j++;
        k++;
    }
}

// Quick Sort
async function quickSort(start = 0, end = array.length - 1) {
    if (isStopped) return;
    if (start >= end) return;

    const pivotIndex = await partition(start, end);
    
    // Highlight the pivot position
    drawArray([pivotIndex], 'green');
    await sleep(animationSpeed);

    await quickSort(start, pivotIndex - 1);
    await quickSort(pivotIndex + 1, end);
}

async function partition(start, end) {
    if (isStopped) return;
    
    const pivot = array[end];
    let i = start - 1;

    // Highlight the pivot
    drawArray([end], 'blue');
    await sleep(animationSpeed);

    for (let j = start; j < end; j++) {
        if (isStopped) return;
        
        // Highlight elements being compared
        drawArray([j, end], 'blue');
        await sleep(animationSpeed);

        if (array[j] <= pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
            
            // Show the swap
            drawArray([i, j], 'green');
            await sleep(animationSpeed);
        }
    }

    [array[i + 1], array[end]] = [array[end], array[i + 1]];
    
    // Show final pivot position
    drawArray([i + 1], 'green');
    await sleep(animationSpeed);

    return i + 1;
}

// Linear Search
async function linearSearch(target) {
    abortController = new AbortController();
    try {
        for (let i = 0; i < array.length; i++) {
            if (isStopped) return;
            
            // Highlight current element being checked
            drawArray([i], 'blue');
            await sleep(animationSpeed);
            
            if (Math.round(array[i]) === target) {
                // Found the target
                drawArray([i], 'green');
                return i;
            }
        }
        // Target not found
        drawArray([], 'red');
        return -1;
    } catch (error) {
        if (error.message !== 'Sorting stopped') {
            console.error(error);
        }
    }
}

// Binary Search
async function binarySearch(target) {
    abortController = new AbortController();
    try {
        let left = 0;
        let right = array.length - 1;

        while (left <= right) {
            if (isStopped) return;
            
            const mid = Math.floor((left + right) / 2);
            
            // Highlight the current search range and middle element
            const searchRange = Array.from({length: right - left + 1}, (_, i) => left + i);
            drawArray(searchRange, 'blue');
            drawArray([mid], 'yellow');
            await sleep(animationSpeed);

            if (Math.round(array[mid]) === target) {
                // Found the target
                drawArray([mid], 'green');
                return mid;
            }

            if (Math.round(array[mid]) < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        // Target not found
        drawArray([], 'red');
        return -1;
    } catch (error) {
        if (error.message !== 'Sorting stopped') {
            console.error(error);
        }
    }
}

// Jump Search
async function jumpSearch(target) {
    abortController = new AbortController();
    try {
        const n = array.length;
        const step = Math.floor(Math.sqrt(n));
        let prev = 0;

        // Finding the block where element is present
        while (prev < n && Math.round(array[Math.min(prev + step, n) - 1]) < target) {
            if (isStopped) return;
            
            // Highlight the current block
            const blockEnd = Math.min(prev + step, n);
            const blockIndices = Array.from({length: blockEnd - prev}, (_, i) => prev + i);
            drawArray(blockIndices, 'blue');
            await sleep(animationSpeed);
            
            prev += step;
        }

        // Linear search in the identified block
        while (prev < Math.min(prev + step, n)) {
            if (isStopped) return;
            
            // Highlight current element being checked
            drawArray([prev], 'yellow');
            await sleep(animationSpeed);

            if (Math.round(array[prev]) === target) {
                // Found the target
                drawArray([prev], 'green');
                return prev;
            }

            if (Math.round(array[prev]) > target) {
                // Target not found
                drawArray([], 'red');
                return -1;
            }

            prev++;
        }

        // Target not found
        drawArray([], 'red');
        return -1;
    } catch (error) {
        if (error.message !== 'Sorting stopped') {
            console.error(error);
        }
    }
}

// Function to select and start an algorithm
function selectAlgorithm(type) {
    isStopped = false;
    isPaused = false;
    currentAlgorithm = type;
    
    // Reset button states
    document.getElementById('pauseBtn').textContent = 'Pause';
    document.getElementById('stopBtn').disabled = false;
    
    // Hide complexity info for other categories, show for current algorithm
    document.querySelectorAll('.algorithm-complexity').forEach(complexity => {
        complexity.style.display = 'none';
    });
    const complexityElement = document.getElementById(type + 'Complexity');
    if (complexityElement) {
        complexityElement.style.display = 'block';
    }

    // Reset array visualization
    resetArray();

    // Start the selected algorithm
    switch(type) {
        case 'bubbleSort':
            bubbleSort();
            break;
        case 'selectionSort':
            selectionSort();
            break;
        case 'insertionSort':
            insertionSort();
            break;
        case 'mergeSort':
            mergeSort(0, array.length - 1);
            break;
        case 'quickSort':
            quickSort(0, array.length - 1);
            break;
        default:
            console.error('Unknown algorithm type:', type);
    }
}

// Start search function
async function startSearch(type) {
  const searchValue = parseInt(document.getElementById('searchValue').value);
  if (isNaN(searchValue)) {
    alert('Please enter a valid number to search');
    return;
  }

  isStopped = false;
  isPaused = false;
  currentAlgorithm = type;
  
  // Show complexity information
  document.querySelectorAll('.algorithm-complexity').forEach(complexity => {
    complexity.style.display = 'none';
  });
  const complexityElement = document.getElementById(type + 'Complexity');
  if (complexityElement) {
    complexityElement.style.display = 'block';
  }
  
  // Reset button states
  document.getElementById('pauseBtn').textContent = 'Pause';
  document.getElementById('stopBtn').disabled = false;
  
  // Disable search buttons during search
  const searchButtons = document.querySelectorAll('.search-controls button');
  searchButtons.forEach(btn => btn.disabled = true);
  
  try {
    let result;
    if (type === 'linear') {
      result = await linearSearch(searchValue);
    } else if (type === 'binary' || type === 'jump') {
      // Sort the array first for binary and jump search
      const originalArray = [...array];
      await quickSort(0, array.length - 1); // Using quickSort for efficiency
      result = type === 'binary' ? 
        await binarySearch(searchValue) : 
        await jumpSearch(searchValue);
      // Restore original array after search
      array.length = 0;
      array.push(...originalArray);
      drawArray(); // Redraw original array
    }
    
    // Display result message on canvas
    ctx.clearRect(0, 0, canvas.width, 40); // Clear previous message area (adjust height if needed)
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    const messageY = 30; // Y position for the message

    if (result !== -1) {
        const resultMessage = `Found ${searchValue} at index ${result}`;
        ctx.fillText(resultMessage, canvas.width/2, messageY);
        console.log(resultMessage); // Log to console as well
    } else {
        const resultMessage = `${searchValue} not found in the array`;
        ctx.fillText(resultMessage, canvas.width/2, messageY);
        console.log(resultMessage); // Log to console as well
    }

  } finally {
    // Re-enable search buttons
    searchButtons.forEach(btn => btn.disabled = false);
  }
}

// Adjust Speed Dynamically
document.getElementById('speed').addEventListener('input', function () {
  // Map slider value (1-100) to animation speed (ms)
  // Example: 1 = 500ms (slowest), 100 = 10ms (fastest)
  const minSpeed = 10; // Fastest animation speed in ms
  const maxSpeed = 500; // Slowest animation speed in ms
  const sliderValue = parseInt(this.value, 10);
  
  animationSpeed = maxSpeed - (sliderValue - 1) * (maxSpeed - minSpeed) / 99;
});

// Adjust Array Size Dynamically
document.getElementById('arraySize').addEventListener('input', function () {
  arraySize = this.value;
  if (!isGraphMode) resetArray();
});

document.getElementById('arraySizeSearch').addEventListener('input', function () {
    arraySize = this.value;
    if (!isGraphMode) resetArray();
});

// Initialize
switchCategory(currentCategory);

// Function to switch between algorithm categories
function switchCategory(category) {
  currentCategory = category;
  
  // Update active button and submenu visibility
  document.querySelectorAll('.nav-button').forEach(button => {
    if (button.onclick.toString().includes(`switchCategory('${category}')`)) {
      button.classList.add('active');
      // Toggle submenu
      const submenu = button.nextElementSibling;
      submenu.classList.toggle('active');
    } else {
      button.classList.remove('active');
      // Hide other submenus
      const submenu = button.nextElementSibling;
      submenu.classList.remove('active');
    }
  });

  // Show/hide control sections
  const sections = ['sortingControls', 'searchingControls', 'graphControls', 'greedyControls'];
  sections.forEach(sectionId => {
    document.getElementById(sectionId).style.display = 'none';
  });
  document.getElementById(`${category}Controls`).style.display = 'block';

  // Reset visualization and complexity display based on category
  if (category === 'sorting' || category === 'searching') {
    isGraphMode = false;
    resetArray();
  } else if (category === 'graph') {
    isGraphMode = true;
    generateRandomGraph();
  } else if (category === 'greedy') {
    isGraphMode = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Reset pause/stop buttons
  isStopped = true;
  isPaused = false;
  document.getElementById('pauseBtn').textContent = 'Pause';
  document.getElementById('stopBtn').disabled = false;
}

// Draw the graph with proper visualization
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges first (so they appear behind nodes)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    graph.edges.forEach(edge => {
        const startNode = graph.nodes[edge.from];
        const endNode = graph.nodes[edge.to];
        
        // Draw edge
        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);
        ctx.lineTo(endNode.x, endNode.y);
        ctx.stroke();
    });
    
    // Draw nodes
    graph.nodes.forEach((node, index) => {
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color || 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw node label
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index.toString(), node.x, node.y);
    });
}

// Generate a random graph with proper structure
function generateRandomGraph() {
    // Clear previous graph
    graph.nodes = [];
    graph.edges = [];
    graph.adjacencyList = {};
    
    // Generate 6-8 nodes in a circular layout
    const numNodes = Math.floor(Math.random() * 3) + 6;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;
    
    // Create nodes in a circular layout
    for (let i = 0; i < numNodes; i++) {
        const angle = (i * 2 * Math.PI) / numNodes;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        graph.nodes.push({ 
            id: i,
            x, 
            y, 
            color: 'white' 
        });
        graph.adjacencyList[i] = [];
    }
    
    // Create a minimum spanning tree to ensure connectivity
    const visited = new Set([0]);
    const unvisited = new Set(Array.from({length: numNodes - 1}, (_, i) => i + 1));
    
    while (unvisited.size > 0) {
        let minEdge = null;
        let minWeight = Infinity;
        
        // Find the minimum weight edge between visited and unvisited nodes
        for (const v of visited) {
            for (const u of unvisited) {
                const weight = Math.random();
                if (weight < minWeight) {
                    minWeight = weight;
                    minEdge = {from: v, to: u};
                }
            }
        }
        
        // Add the edge to the graph
        if (minEdge) {
            graph.edges.push(minEdge);
            graph.adjacencyList[minEdge.from].push(minEdge.to);
            graph.adjacencyList[minEdge.to].push(minEdge.from);
            visited.add(minEdge.to);
            unvisited.delete(minEdge.to);
        }
    }
    
    // Add some additional random edges
    const additionalEdges = Math.floor(numNodes * 0.5);
    for (let i = 0; i < additionalEdges; i++) {
        const from = Math.floor(Math.random() * numNodes);
        const to = Math.floor(Math.random() * numNodes);
        
        if (from !== to && !graph.adjacencyList[from].includes(to)) {
            graph.edges.push({from, to});
            graph.adjacencyList[from].push(to);
            graph.adjacencyList[to].push(from);
        }
    }
    
    // Update source/destination input max values
    document.getElementById('sourceNode').max = numNodes - 1;
    document.getElementById('destNode').max = numNodes - 1;
    
    // Reset input values
    document.getElementById('sourceNode').value = '0';
    document.getElementById('destNode').value = '0';
    
    drawGraph();
}

// BFS Algorithm with proper path finding
async function bfs(startNode) {
    abortController = new AbortController();
    try {
        const visited = new Set();
        const queue = [startNode];
        const parent = new Map();
        visited.add(startNode);
        
        const destNode = parseInt(document.getElementById('destNode').value);
        
        // Reset node colors
        graph.nodes.forEach(node => node.color = 'white');
        drawGraph();
        await sleep(animationSpeed);
        
        // Display start and destination nodes
        graph.nodes[startNode].color = 'yellow';
        if (destNode !== startNode) {
            graph.nodes[destNode].color = 'orange';
        }
        drawGraph();
        await sleep(animationSpeed);
        
        while (queue.length > 0 && !isStopped) {
            const current = queue.shift();
            
            // Highlight current node
            graph.nodes[current].color = 'blue';
            drawGraph();
            await sleep(animationSpeed);
            
            if (current === destNode) {
                // Reconstruct and highlight path
                let node = current;
                const path = [];
                while (parent.has(node)) {
                    path.unshift(node);
                    node = parent.get(node);
                }
                path.unshift(startNode);
                
                // Animate the path
                for (const pathNode of path) {
                    graph.nodes[pathNode].color = 'green';
                    drawGraph();
                    await sleep(animationSpeed);
                }
                
                // Display success message
                ctx.fillStyle = 'white';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Path found! Length: ${path.length - 1}`, canvas.width/2, 30);
                return true;
            }
            
            // Process neighbors
            const neighbors = graph.adjacencyList[current] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    parent.set(neighbor, current);
                    
                    // Highlight neighbor
                    graph.nodes[neighbor].color = 'lightblue';
                    drawGraph();
                    await sleep(animationSpeed);
                }
            }
            
            // Mark as visited
            if (current !== startNode) {
                graph.nodes[current].color = 'green';
                drawGraph();
                await sleep(animationSpeed);
            }
        }
        
        // No path found
        graph.nodes.forEach(node => node.color = 'red');
        drawGraph();
        
        // Display failure message
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No path found!', canvas.width/2, 30);
        return false;
    } catch (error) {
        if (error.message !== 'Sorting stopped') {
            console.error(error);
        }
    }
}

// DFS Algorithm with proper traversal
async function dfs(startNode) {
    abortController = new AbortController();
    try {
        const visited = new Set();
        const stack = [startNode];
        const discoveryTime = new Map();
        const finishTime = new Map();
        const parent = new Map();
        let time = 0;
        
        const destNode = parseInt(document.getElementById('destNode').value);
        
        // Reset node colors
        graph.nodes.forEach(node => node.color = 'white');
        drawGraph();
        await sleep(animationSpeed);
        
        // Display start and destination nodes
        graph.nodes[startNode].color = 'yellow';
        if (destNode !== startNode) {
            graph.nodes[destNode].color = 'orange';
        }
        drawGraph();
        await sleep(animationSpeed);
        
        while (stack.length > 0 && !isStopped) {
            const current = stack[stack.length - 1];
            
            if (!visited.has(current)) {
                visited.add(current);
                discoveryTime.set(current, time++);
                
                // Highlight current node
                graph.nodes[current].color = 'blue';
                drawGraph();
                await sleep(animationSpeed);
                
                // Check if we found the destination
                if (current === destNode) {
                    // Reconstruct and highlight path
                    let node = current;
                    const path = [];
                    while (parent.has(node)) {
                        path.unshift(node);
                        node = parent.get(node);
                    }
                    path.unshift(startNode);
                    
                    // Animate the path
                    for (const pathNode of path) {
                        graph.nodes[pathNode].color = 'green';
                        drawGraph();
                        await sleep(animationSpeed);
                    }
                    
                    // Display success message
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`Path found! Length: ${path.length - 1}`, canvas.width/2, 30);
                    return true;
                }
                
                // Process neighbors in reverse order for DFS
                const neighbors = [...(graph.adjacencyList[current] || [])].reverse();
                let hasUnvisitedNeighbor = false;
                
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        stack.push(neighbor);
                        parent.set(neighbor, current);
                        hasUnvisitedNeighbor = true;
                        
                        // Highlight neighbor
                        graph.nodes[neighbor].color = 'lightblue';
                        drawGraph();
                        await sleep(animationSpeed);
                    }
                }
                
                if (!hasUnvisitedNeighbor) {
                    finishTime.set(current, time++);
                    if (current !== startNode) {
                        graph.nodes[current].color = 'green';
                    }
                    drawGraph();
                    await sleep(animationSpeed);
                    stack.pop();
                }
            } else {
                if (!finishTime.has(current)) {
                    finishTime.set(current, time++);
                    if (current !== startNode) {
                        graph.nodes[current].color = 'green';
                    }
                    drawGraph();
                    await sleep(animationSpeed);
                }
                stack.pop();
            }
        }
        
        // No path found
        if (!isStopped) {
            graph.nodes.forEach(node => node.color = 'red');
            drawGraph();
            
            // Display failure message
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No path found!', canvas.width/2, 30);
        }
        return false;
    } catch (error) {
        if (error.message !== 'Sorting stopped') {
            console.error(error);
        }
    }
}

// Update startGraphAlgorithm function
function startGraphAlgorithm(type) {
    currentCategory = 'graph';
    currentAlgorithm = type;
    isStopped = false;
    isPaused = false;
    
    // Set a slower default speed for graph algorithms
    const speedControl = document.getElementById('speed');
    speedControl.value = 20;
    const event = new Event('input');
    speedControl.dispatchEvent(event);
    
    // Hide all control sections first
    document.querySelectorAll('.controls-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show graph controls
    document.getElementById('graphControls').style.display = 'block';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const sourceNodeInput = document.getElementById('sourceNode');
    const destNodeInput = document.getElementById('destNode');
    
    // Show source and destination node inputs for both BFS and DFS
    sourceNodeInput.parentElement.style.display = (type === 'bfs' || type === 'dfs') ? 'block' : 'none';
    destNodeInput.parentElement.style.display = (type === 'bfs' || type === 'dfs') ? 'block' : 'none';
    
    const sourceNode = parseInt(sourceNodeInput.value);
    const destNode = parseInt(destNodeInput.value);
    
    // Check for valid source node for BFS/DFS
    if ((type === 'bfs' || type === 'dfs') && (isNaN(sourceNode) || sourceNode < 0 || sourceNode >= graph.nodes.length)) {
        alert('Please enter a valid source node (0 to ' + (graph.nodes.length - 1) + ')');
        return;
    }
    
    // Check for valid destination node for BFS/DFS
    if ((type === 'bfs' || type === 'dfs') && (isNaN(destNode) || destNode < 0 || destNode >= graph.nodes.length)) {
        alert('Please enter a valid destination node (0 to ' + (graph.nodes.length - 1) + ')');
        return;
    }
    
    // Hide complexity information for other categories, show for graph
    document.querySelectorAll('.algorithm-complexity').forEach(complexity => {
        complexity.style.display = 'none';
    });
    const complexityElement = document.getElementById(type + 'Complexity');
    if (complexityElement) {
        complexityElement.style.display = 'block';
    }
    
    // Reset button states
    document.getElementById('pauseBtn').textContent = 'Pause';
    document.getElementById('stopBtn').disabled = false;
    
    // Start the algorithm
    if (type === 'bfs') {
        bfs(sourceNode);
    } else if (type === 'dfs') {
        dfs(sourceNode);
    } else if (type === 'generateGraph') {
        generateRandomGraph();
    }
}

// Update startGreedyAlgorithm function
function startGreedyAlgorithm(type) {
    currentCategory = 'greedy';
    currentAlgorithm = type;

    // Set a slower default speed for greedy algorithms (1x)
    const speedControl = document.getElementById('speed');
    speedControl.value = 20; // Corresponds to a slower speed
    const event = new Event('input');
    speedControl.dispatchEvent(event);

    // Hide all control sections first
    document.querySelectorAll('.controls-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show greedy controls
    document.getElementById('greedyControls').style.display = 'block';

    // Show/hide specific inputs based on algorithm
    document.getElementById('huffmanText').parentElement.style.display =
        type === 'huffman' ? 'block' : 'none';
    document.getElementById('knapsackCapacity').parentElement.style.display =
        type === 'knapsack' ? 'block' : 'none';

    // Hide complexity information for other categories, show for greedy
    document.querySelectorAll('.algorithm-complexity').forEach(complexity => {
        complexity.style.display = 'none';
    });
    const complexityElement = document.getElementById(type + 'Complexity');
    if (complexityElement) {
        complexityElement.style.display = 'block';
    }

    // Reset button states
    document.getElementById('pauseBtn').textContent = 'Pause';
    document.getElementById('stopBtn').disabled = false;

    // Clear canvas or draw initial state based on algorithm
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Trigger data generation and visualization for Huffman and Knapsack
    if (type === 'huffman' || type === 'knapsack') {
        // Small delay to allow UI update before data generation/visualization
        setTimeout(() => {
            generateGreedyData();
        }, 50);
    }

}

// Generate data for greedy algorithms
async function generateGreedyData() {
    if (currentAlgorithm === 'huffman') {
        const text = document.getElementById('huffmanText').value;
        if (!text) {
            alert('Please enter text for Huffman coding');
            return;
        }
        await generateHuffmanTree(text);
    } else if (currentAlgorithm === 'knapsack') {
        const capacity = parseInt(document.getElementById('knapsackCapacity').value);
        if (isNaN(capacity) || capacity <= 0) {
            alert('Please enter a valid knapsack capacity');
            return;
        }
        generateKnapsackItems(capacity);
    }
}

// Huffman Coding
async function generateHuffmanTree(text) {
    // Calculate character frequencies
    const freq = {};
    for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
    }

    // Create priority queue (min heap)
    const queue = Object.entries(freq).map(([char, count]) => ({
        char,
        count,
        left: null,
        right: null,
        x: 0,  // Add position properties for animation
        y: 0,
        level: 0
    })).sort((a, b) => a.count - b.count);

    // Clear canvas and show initial state
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    // ctx.fillText('Building Huffman Tree...', canvas.width/2, 30); // Removed this line

    // Draw initial frequency table
    let y = 80;
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white'; // Ensure text color is white
    ctx.fillText('Character Frequencies:', 20, y);
    y += 30;
    
    for (const [char, count] of Object.entries(freq)) {
        ctx.fillText(`${char}: ${count}`, 40, y);
        y += 25;
    }
    await sleep(animationSpeed * 2);

    // Build Huffman tree with animation
    while (queue.length > 1) {
        const left = queue.shift();
        const right = queue.shift();
        
        // Animate merging nodes
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Merging Nodes...', canvas.width/2, 30);
        
        // Draw current nodes being merged
        // Need to draw them properly with their positions or a simplified representation
        // For now, just clearing and showing merging message.
        // A more advanced animation would show the nodes moving.
        // drawNode(left, canvas.width/2 - 100, 100, 0, true);
        // drawNode(right, canvas.width/2 + 100, 100, 0, true);
        await sleep(animationSpeed);

        const parent = {
            char: null,
            count: left.count + right.count,
            left,
            right,
            x: 0,
            y: 0,
            level: 0
        };
        
        // Insert parent back into queue
        const insertIndex = queue.findIndex(node => node.count > parent.count);
        if (insertIndex === -1) {
            queue.push(parent);
        } else {
            queue.splice(insertIndex, 0, parent);
        }
        
        await sleep(animationSpeed);
    }

    huffmanTree = queue[0];
    await visualizeHuffmanTree();
}

// Visualize Huffman tree with animations
async function visualizeHuffmanTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Huffman Tree Visualization', canvas.width/2, 30);
    
    // Calculate tree layout
    const startX = canvas.width / 2;
    const startY = 80;
    //const levelHeight = 80; // Not used directly in layout calculation
    //const maxLevel = getTreeHeight(huffmanTree); // Not strictly needed for final draw
    
    // Draw the tree in its final state first
    drawTreeFinal(huffmanTree, startX, startY, 1);
    
    // Draw codes in a table format with animation
    const codes = generateHuffmanCodes(huffmanTree);
    await displayHuffmanCodes(codes);
}

// Get tree height for layout calculation
function getTreeHeight(node) {
    if (!node) return 0;
    return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
}

// Draw node with animation
// This function is currently used for the initial animated tree drawing.
// async function drawNodeAnimated(node, x, y, level, maxLevel) {
//     if (!node) return;

//     // Calculate child positions
//     const levelWidth = canvas.width / Math.pow(2, level);
//     const leftX = x - levelWidth/2;
//     const rightX = x + levelWidth/2;
//     const childY = y + 80;

//     // Draw edges first
//     if (node.left || node.right) {
//         ctx.strokeStyle = 'white';
//         ctx.lineWidth = 2;
        
//         if (node.left) {
//             ctx.beginPath();
//             ctx.moveTo(x, y + 25);
//             ctx.lineTo(leftX, childY - 25);
//             ctx.stroke();
//             ctx.fillStyle = 'white';
//             ctx.font = '12px Arial';
//             ctx.textAlign = 'center';
//             ctx.fillText('0', x - 15, y + 40);
//         }
        
//         if (node.right) {
//             ctx.beginPath();
//             ctx.moveTo(x, y + 25);
//             ctx.lineTo(rightX, childY - 25);
//             ctx.stroke();
//             ctx.fillStyle = 'white';
//             ctx.font = '12px Arial';
//             ctx.textAlign = 'center';
//             ctx.fillText('1', x + 15, y + 40);
//         }
//     }

//     // Draw node with animation
//     ctx.beginPath();
//     ctx.arc(x, y, 25, 0, Math.PI * 2);
//     ctx.fillStyle = 'white
//     ctx.fill();
//     ctx.strokeStyle = 'black';
//     ctx.lineWidth = 2;
//     ctx.stroke();

//     // Draw node content
//     ctx.fillStyle = 'black';
//     ctx.font = 'bold 14px Arial';
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     const content = node.char ? `${node.char}:${node.count}` : node.count;
//     ctx.fillText(content, x, y);
    
//     await sleep(animationSpeed/2);

//     // Recursively draw children
//     if (node.left) {
//         await drawNodeAnimated(node.left, leftX, childY, level + 1, maxLevel);
//     }
//     if (node.right) {
//         await drawNodeAnimated(node.right, rightX, childY, level + 1, maxLevel);
//     }
// }

// Draw tree in final state (no animation)
function drawTreeFinal(node, x, y, level) {
    if (!node) return;

    // Calculate child positions
    const levelWidth = canvas.width / Math.pow(2, level);
    const leftX = x - levelWidth/2;
    const rightX = x + levelWidth/2;
    const childY = y + 80;

    // Draw edges first
    if (node.left || node.right) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        
        if (node.left) {
            ctx.beginPath();
            ctx.moveTo(x, y + 25);
            ctx.lineTo(leftX, childY - 25);
            ctx.stroke();
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('0', x - 15, y + 40);
        }
        
        if (node.right) {
            ctx.beginPath();
            ctx.moveTo(x, y + 25);
            ctx.lineTo(rightX, childY - 25);
            ctx.stroke();
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('1', x + 15, y + 40);
        }
    }

    // Draw node
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw node content
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const content = node.char ? `${node.char}:${node.count}` : node.count;
    ctx.fillText(content, x, y);
    
    // Recursively draw children
    if (node.left) {
        drawTreeFinal(node.left, leftX, childY, level + 1);
    }
    if (node.right) {
        drawTreeFinal(node.right, rightX, childY, level + 1);
    }
}

// Display Huffman codes with animation and path highlighting
async function displayHuffmanCodes(codes) {
    const startY = canvas.height - 150;
    const startX = 20; // Starting X position for the list

    // Draw the title for the codes section
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Final Huffman Codes:', startX, startY);
    
    let y = startY + 30;
    ctx.font = '14px Arial';
    
    // Sort codes by character for better readability
    const sortedCodes = Object.entries(codes).sort((a, b) => a[0].localeCompare(b[0]));
    
    // Clear previous code display area before drawing new codes
    // This helps ensure the new list is clean, especially if the number of codes changes
    ctx.clearRect(startX, startY, canvas.width - startX, canvas.height - startY);
     // Redraw the title after clearing
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Final Huffman Codes:', startX, startY);

    for (const [char, code] of sortedCodes) {
        // Draw character and code using the requested format
        ctx.fillStyle = 'white';
        ctx.fillText(`${char} → ${code}`, startX + 20, y);
        
        // Highlight the path in the tree for each code
        // This part can be kept for a sequential animation of paths,
        // or modified for interactive highlighting later if desired.
        await highlightEncodingPath(huffmanTree, code);
        
        y += 25;
        //await sleep(animationSpeed); // Keep a small delay for visual separation
    }
     await sleep(animationSpeed * 2); // Pause at the end to show the final state
}

// Highlight encoding path in the tree
async function highlightEncodingPath(node, code, x = canvas.width/2, y = 80, level = 1) {
    if (!node || code.length === 0) return;
    
    // Highlight current node
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw node content to keep it visible
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const content = node.char ? `${node.char}:${node.count}` : node.count;
    ctx.fillText(content, x, y);
    
    await sleep(animationSpeed/2);
    
    // Calculate child positions
    const levelWidth = canvas.width / Math.pow(2, level);
    const leftX = x - levelWidth/2;
    const rightX = x + levelWidth/2;
    const childY = y + 80;
    
    // Follow the path based on the code
    if (code[0] === '0' && node.left) {
        await highlightEncodingPath(node.left, code.slice(1), leftX, childY, level + 1);
    } else if (code[0] === '1' && node.right) {
        await highlightEncodingPath(node.right, code.slice(1), rightX, childY, level + 1);
    }
    
    // Reset node color after highlighting the path for the current character
    // We need to redraw the node in its default state
     ctx.beginPath();
     ctx.arc(x, y, 25, 0, Math.PI * 2);
     ctx.fillStyle = 'white';
     ctx.fill();
     ctx.strokeStyle = 'black';
     ctx.lineWidth = 2;
     ctx.stroke();
     ctx.fillStyle = 'black';
     ctx.fillText(content, x, y);
}

// Generate Huffman codes
function generateHuffmanCodes(node, code = '', codes = {}) {
    if (!node) return codes;
    
    if (node.char) {
        codes[node.char] = code || '0';
    }
    
    generateHuffmanCodes(node.left, code + '0', codes);
    generateHuffmanCodes(node.right, code + '1', codes);
    
    return codes;
}

// Fractional Knapsack
function generateKnapsackItems(capacity) {
    // Generate random items
    const numItems = 5;
    knapsackItems = Array.from({ length: numItems }, (_, i) => ({
            id: i, // Add item index
            value: Math.floor(Math.random() * 50) + 1,
            weight: Math.floor(Math.random() * 20) + 1
    }));

    // Sort items by value/weight ratio and calculate ratio
    knapsackItems.forEach(item => item.ratio = item.value / item.weight);
    knapsackItems.sort((a, b) => b.ratio - a.ratio);

    // Solve knapsack
    let remainingCapacity = capacity;
    let totalValue = 0;
    const solution = [];

    for (const item of knapsackItems) {
        if (remainingCapacity >= item.weight) {
            // Take whole item
            solution.push({ ...item, fraction: 1 });
            totalValue += item.value; // Add full value
            remainingCapacity -= item.weight;
        } else if (remainingCapacity > 0) {
            // Take fraction of item
            const fraction = remainingCapacity / item.weight;
            solution.push({ ...item, fraction });
            totalValue += item.value * fraction; // Add fractional value
            remainingCapacity = 0;
            break; // Knapsack is full
        } else {
            break; // Knapsack is already full
        }
    }
    
    visualizeKnapsack(knapsackItems, solution, totalValue, capacity); // Pass all items, solution, totalValue and capacity
}

// Visualize Knapsack solution
function visualizeKnapsack(allItems, solution, totalValue, capacity) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Fractional Knapsack Solution', canvas.width/2, 30);
    
    // Display items sorted by value/weight ratio
    let textY = 70;
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.fillText('Items (sorted by Value/Weight Ratio):', 20, textY);
    textY += 25;

    allItems.forEach(item => {
        ctx.fillText(`Item ${item.id}: Value=${item.value}, Weight=${item.weight}, Ratio=${item.ratio.toFixed(2)}`, 40, textY);
        textY += 20;
    });
    
    // Draw items visualization (bars)
    const startX = 50;
    const barStartY = textY + 30; // Start bars below the text list
    const barWidth = 60;
    const maxHeight = 200; // Reduced max height to make space
    const spacing = 30;
    const labelHeight = 60; // Space needed for labels below the bar
    
    // Determine max value for scaling bar height
    const maxValue = Math.max(...allItems.map(item => item.value));
    
    // Draw value bars
    solution.forEach((item, index) => {
        const x = startX + index * (barWidth + spacing);
        const height = (item.value / maxValue) * maxHeight * item.fraction; // Scale height by value and fraction
        
        // Draw bar (representing fraction taken)
        ctx.fillStyle = 'white';
        ctx.fillRect(x, barStartY + maxHeight - height, barWidth, height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, barStartY + maxHeight - height, barWidth, height);

        // Draw item details as labels below the bar
        ctx.fillStyle = 'white'; // Changed label color to white for better contrast
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        
        let labelY = barStartY + maxHeight + 15; // Position labels below the bar
        ctx.fillText(`Item ${item.id}`, x + barWidth/2, labelY);
        labelY += 15;
        ctx.fillText(`V:${item.value} W:${item.weight}`, x + barWidth/2, labelY);
        labelY += 15;
        ctx.fillText(`${Math.round(item.fraction * 100)}% Taken`, x + barWidth/2, labelY);
    });
    
    // Draw summary
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    // Position summary below the bars and their labels
    ctx.fillText(`Maximum value in knapsack: ${totalValue.toFixed(2)}`, 20, barStartY + maxHeight + labelHeight + 30);
    ctx.fillText(`Capacity Used: ${(capacity - remainingCapacity).toFixed(2)}/${capacity.toFixed(2)}`, 20, barStartY + maxHeight + labelHeight + 60);
}