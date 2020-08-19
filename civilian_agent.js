const YELLOW = [255, 255, 0]; 
const DARK_YELLOW = [160, 160, 0];
const PINK = [255, 0, 255];
const DARK_PINK = [160, 0, 160];

const MAX_INTERACTIONS_MEMORY = 5;

const HIGH_VIOLENT_CRIME_ADJ = 996; // In 2018, D.C. was the state with the highest violent crime rate (https://www.statista.com/statistics/200445/reported-violent-crime-rate-in-the-us-states/)
const LOW_VIOLENT_CRIME_ADJ = 112; // In 2018, Maine was the state with the lowest violent crime rate (https://www.statista.com/statistics/200445/reported-violent-crime-rate-in-the-us-states/)
const HIGH_PROPERTY_CRIME_ADJ = 4374; // In 2018, D.C. was the state with the highest property crime rate (https://www.statista.com/statistics/232575/property-crime-rate-in-the-us-by-state/)
const LOW_PROPERTY_CRIME_ADJ = 1249; // In 2018, New Hampshire was the state with the lowest property crime rate (https://www.statista.com/statistics/232575/property-crime-rate-in-the-us-by-state/)

// Calculate exponential moving average, given array of values and constant smoothing factor
// Assuming values further back in the array are more recent
function ema(arr, a) {
  // Assume arr will have at least one element
  var res = arr[arr.length - 1];
  for (var i = arr.length - 2; i >= 0; i--) {
    res = (a * res) + ((1 - a) * res[i]);
  }
  return res;
}

// Use ema to calculate impression of police, given recent history
// From 0 to 1, 0 being total trust, 1 being total distrust
function civilian_ema(history) {
  const POLICE_RESOLVE_CRIME = 0;
  const POLICE_RESOLVE_CRIME_EF = 0.3; 
  const POLICE_PUNISH = 0.7; 
  const POLICE_PUNISH_EF = 1; 
  var arr = []; 
  history.forEach(instance => {
    if (instance.type == "called" && !instance.excessive_force) {
      arr.push(POLICE_RESOLVE_CRIME);
    } else if (instance.type == "called" && instance.excessive_force) {
      arr.push(POLICE_RESOLVE_CRIME_EF);
    } else if (instance.type == "punished" && !instance.excessive_force) {
      arr.push(POLICE_PUNISH);
    } else if (instance.type == "punished" && instance.excessive_force) {
      arr.push(POLICE_PUNISH_EF);
    } else {
      console.log("Error in calculating civilian ema!");
    }
  });
  return ema(arr, 0.5);
}

// Return the number of steps needed to travel between position and destination
function stepsBetween(position, destination) {
  var x_diff = Math.abs(position[0] - destination[0]);
  var y_diff = Math.abs(position[1] - destination[1]);
  if (x_diff > y_diff) {
    return x_diff; 
  } else {
    return y_diff;
  }
}

// Randomly wander any direction or stay in same spot
function wander(position, x_bounds_start, y_bounds_start, x_bounds_end, y_bounds_end, speed) {
  var temp = Math.random();
  if (temp < (1/9)) {
    position[0] -= speed;
    position[1] += speed;
  } else if (temp < (2/9)) {
    position[1] += speed;
  } else if (temp < (3/9)) {
    position[0] += speed; 
    position[1] += speed;
  } else if (temp < (4/9)) {
    position[0] -= speed; 
  } else if (temp < (5/9)) {
    // Stay in same spot
  } else if (temp < (6/9)) {
    position[0] += speed; 
  } else if (temp < (7/9)) {
    position[0] -= speed;
    position[1] -= speed; 
  } else if (temp < (8/9)) {
    position[1] -= speed; 
  } else {
    position[0] += speed; 
    position[1] -= speed;
  }
  if (position[0] <= x_bounds_start) {
    position[0] += speed;
  } else if (position[0] >= x_bounds_end) {
    position[0] -= speed;
  }
  if (position[1] <= y_bounds_start) {
    position[1] += speed;
  } else if (position[1] >= y_bounds_end) {
    position[1] -= speed;
  }  
  return position;
}

// Move position one step closer to destination point
function travelToPoint(position, destination, speed) {
  var orig_x = position[0]; 
  var orig_y = position[1];
  if (position[0] < destination[0] && position[1] < destination[1]) {
    position[0] += speed; 
    position[1] += speed;
  } else if (position[0] < destination[0] && position[1] == destination[1]) {
    position[0] += speed; 
  } else if (position[0] < destination[0] && position[1] > destination[1]) {
    position[0] += speed; 
    position[1] -= speed;
  } else if (position[0] == destination[0] && position[1] < destination[1]) {
    position[1] += speed;
  } else if (position[0] == destination[0] && position[1] == destination[1]) {
    // Already at target -- this should never happen (no overlapping agents)
  } else if (position[0] == destination[0] && position[1] > destination[1]) {
    position[1] -= speed;
  } else if (position[0] > destination[0] && position[1] < destination[1]) {
    position[0] -= speed;
    position[1] += speed;
  } else if (position[0] > destination[0] && position[1] == destination[1]) {
    position[0] -= speed;
  } else if (position[0] > destination[0] && position[1] > destination[1]) {
    position[0] -= speed;
    position[1] -= speed;
  } else {
    console.log("Error in traveling to point");
  }
  return position;
}

function generateColor(race) {
  if (race == "white") {
    return [253, 224, 196]; // Light skin tone
  } else if (race == "black") {
    return [101, 78, 65]; // Dark skin tone
  } else if (race == "amerindian") {
    return [231, 194, 159]; // Medium-light skin tone
  } else if (race == "asian") {
    return [201, 153, 115]; // Medium skin tone
  } else if (race == "hawaiian") {
    return [168, 111, 70]; // Medium-dark skin tone
  } else {
    return [201, 153, 115]; // Medium skin tone
  }
}

function behavior(state, context) {
  const { topology, pd, community, impact_crime } = context.globals();
  const x_bounds = topology.x_bounds[1];
  const y_bounds = topology.y_bounds[1];
  let position = state.get("position");
  let community_name = state.get("community_name");
  let a_start = state.get("a_start");
  let b_start = state.get("b_start");
  let a_end = state.get("a_end");
  let b_end = state.get("b_end");
  let race = state.get("race");
  let default_color = generateColor(race);
  let cur_color = state.get("rgb");
  let violent_crime_adj = state.get("violent_crime_adj");
  let property_crime_adj = state.get("property_crime_adj");
  let crime_score = state.get("crime_score");
  let is_victim_of_violent_crime = state.get("is_victim_of_violent_crime"); 
  let is_victim_of_property_crime = state.get("is_victim_of_property_crime");
  let crime_source_id = state.get("crime_source_id");
  let crime_source_race = state.get("crime_source_race");
  let is_committing_violent_crime = state.get("is_committing_violent_crime"); 
  let is_committing_property_crime = state.get("is_committing_property_crime");
  let crime_target_id = state.get("crime_target_id");
  let called_police = state.get("called_police");
  let going_to_commit_crime = state.get("going_to_commit_crime");
  let recent_police_interactions = state.get("recent_police_interactions");
  let police_impression = state.get("police_impression");
  // Adjust the crime rate if need be
  const adj_crime_rate_events = context.messages().filter(msg => msg.type === "adjust_crime_rate");
  adj_crime_rate_events.forEach(m => {
    if (m.data.excessive_force) {
      violent_crime_adj = violent_crime_adj * impact_crime.excessive_force;
      property_crime_adj = property_crime_adj * impact_crime.excessive_force;
    } else {
      violent_crime_adj = violent_crime_adj * impact_crime.general;
      property_crime_adj = property_crime_adj * impact_crime.general;
    }
  });
  // Adjust crime rates passively (time)
  violent_crime_adj = violent_crime_adj * impact_crime.time;
  property_crime_adj = property_crime_adj * impact_crime.time;
  if (!is_victim_of_violent_crime && !is_victim_of_property_crime && !is_committing_violent_crime && !is_committing_property_crime && going_to_commit_crime == "none") {
    // Determine if agent is now the victim of a violent crime
    const violent_crimes = context.messages().filter(msg => msg.type === "violent_crime");
    violent_crimes.forEach(m => 
      {
        is_victim_of_violent_crime = true;
        crime_source_id = m.from;
        crime_source_race = m.data.race;
      }
    );
  }
  if (!is_victim_of_violent_crime && !is_victim_of_property_crime && !is_committing_violent_crime && !is_committing_property_crime  && going_to_commit_crime == "none") {
    // Determine if agent is now the victim of a property crime
    const property_crimes = context.messages().filter(msg => msg.type === "property_crime");
    property_crimes.forEach(m => 
      {
        is_victim_of_property_crime = true;
        crime_source_id = m.from;
        crime_source_race = m.data.race;
      }
    );
  }
  // If the victim of a crime and haven't yet called, call the police
  if ((is_victim_of_violent_crime || is_victim_of_property_crime) && !called_police) {
    called_police = true;
    state.addMessage(
      "police_operator", 
      "crime_call", 
      {
        msg: "I am calling the police!", 
        caller_position: position, 
        crime_source_id: crime_source_id, 
        crime_source_race: crime_source_race, 
        crime_score: crime_score
      }
    );
  }
  // Determine if police agent is taking action
  const police_action_for_caller = context.messages().filter(msg => msg.type === "end_crime_for_caller");
  const police_action_for_criminal = context.messages().filter(msg => msg.type === "end_crime_for_criminal");
  // Get nearby civilian agents
  const neighbors_civilian = context.neighbors().filter(n => n.type === "civilian_agent");
  // What agent perceives about nearby civilian neighbors
  let neighbors_civilian_knowledge = [];
  // Filter civilians so that only the ones in the same community, and not being robbed etc., are included
  neighbors_civilian.forEach(cur_neighbor => {
    if ((cur_neighbor.community_name == community_name) && !cur_neighbor.is_committing_property_crime && !cur_neighbor.is_committing_violent_crime && !cur_neighbor.is_victim_of_property_crime && !cur_neighbor.is_victim_of_violent_crime) {
      neighbors_civilian_knowledge.push({
        position: cur_neighbor.position, 
        race: cur_neighbor.race,
        agent_id: cur_neighbor.agent_id
      });
    }
  });  
  // Sort by proximity
  neighbors_civilian_knowledge.sort(function(a, b) {
    var proximity_a = stepsBetween(position, a.position);
    var proximity_b = stepsBetween(position, b.position);
    if (proximity_a < proximity_b) return -1;
    if (proximity_a > proximity_b) return 1;
    return 0;
  });
  // End crime if police here
  police_action_for_caller.forEach(m => {
    is_victim_of_property_crime = false; 
    is_victim_of_violent_crime = false; 
    crime_source_id = "nobody";
    crime_source_race = "n/a";
    // Record this interaction with police in history
    recent_police_interactions.push({
      type: "called", 
      excessive_force: m.data.excessive_force
    });
    if (recent_police_interactions.length > MAX_INTERACTIONS_MEMORY) {
      // Remove the farthest interaction
      recent_police_interactions.shift();
    }
    police_impression = civilian_ema(recent_police_interactions);
  });
  police_action_for_criminal.forEach(m => {
    is_committing_property_crime = false; 
    is_committing_violent_crime = false; 
    crime_target_id = "nobody";
    // Record this interaction with police in history
    recent_police_interactions.push({
      type: "punished", 
      excessive_force: m.data.excessive_force
    });
    if (recent_police_interactions.length > MAX_INTERACTIONS_MEMORY) {
      // Remove the farthest interaction
      recent_police_interactions.shift();
    }
    // Update impression of police
    police_impression = civilian_ema(recent_police_interactions);
    // Update crime rate for self
    if (m.data.excessive_force) {
      violent_crime_adj = violent_crime_adj * impact_crime.excessive_force;
      property_crime_adj = property_crime_adj * impact_crime.excessive_force;
    } else {
      violent_crime_adj = violent_crime_adj * impact_crime.general;
      property_crime_adj = property_crime_adj * impact_crime.general;
    }
    // Send message to civilians to update their crime rates
    neighbors_civilian_knowledge.forEach(cur_neighbor => {
      state.addMessage(
        cur_neighbor.agent_id, 
        "adjust_crime_rate", 
        {
          msg: "Crime was committed, adjust crime rate",
          excessive_force: m.data.excessive_force
        }
      );
    });
    // Then do the community patches
    const community_patches = context.neighbors().filter(n => n.type === "community_patch").filter(n => n.name === community_name);
    community_patches.forEach(cur_patch => {
      state.addMessage(
        cur_patch.agent_id, 
        "adjust_crime_rate", 
        {
          msg: "Crime was committed, adjust crime rate",
          excessive_force: m.data.excessive_force
        }
      );
    });
  });
  if (!is_victim_of_violent_crime && !is_victim_of_property_crime && !is_committing_violent_crime && !is_committing_property_crime && going_to_commit_crime == "none") {
    if (Math.random() < violent_crime_adj) {
      // Commit a violent crime against closest person
      going_to_commit_crime = "violent";
    } else if (Math.random() < property_crime_adj) {
      // Commit a property crime against closest person
      going_to_commit_crime = "property";
    }
  } 
  var cur_closest_neighbor = neighbors_civilian_knowledge[0];
  if (going_to_commit_crime == "none") {
  } else {
    // See if agent is close enough to commit crime to closest agent (this can change!)
    if (stepsBetween(position, cur_closest_neighbor.position) <= 1) {
      // Commit a crime for reals!
      if (going_to_commit_crime == "violent") {
        crime_target_id = cur_closest_neighbor.agent_id; 
        state.addMessage(
          crime_target_id, 
          "violent_crime", 
          {
            msg: "I am committing a violent crime against you!", 
            race: race
          }
        ); 
        is_committing_violent_crime = true;
      } else {
        crime_target_id = cur_closest_neighbor.agent_id; 
        state.addMessage(
          crime_target_id, 
          "property_crime", 
          {
            msg: "I am committing a violent crime against you!", 
            race: race
          }
        ); 
        is_committing_property_crime = true;
      }
      going_to_commit_crime = "none"; 
    } else {
      // Walk toward closest neighbor
      position = travelToPoint(position, cur_closest_neighbor.position, 1);
    }
  }
  // Set appropriate agent color
  if (is_victim_of_violent_crime) {
    // Blink pink
    if (cur_color == PINK) {
      state.set("rgb", default_color);
    } else {
      state.set("rgb", PINK);
    }
    // Jump up and down
    if (position[2] == 1) {
      position[2] = 2;
    } else {
      position[2] = 1;
    }
  } else if (is_victim_of_property_crime) {
    // Blink yellow
    if (cur_color == YELLOW) {
      state.set("rgb", default_color);
    } else {
      state.set("rgb", YELLOW);
    }
    // Jump up and down
    if (position[2] == 1) {
      position[2] = 2;
    } else {
      position[2] = 1;
    }
  } else if (is_committing_violent_crime) {
    // Blink pink
    if (cur_color == DARK_PINK) {
      state.set("rgb", default_color);
    } else {
      state.set("rgb", DARK_PINK);
    }
    // Jump up and down
    if (position[2] == 1) {
      position[2] = 4;
    } else {
      position[2] = 1;
    }
  } else if (is_committing_property_crime) {
    // Blink yellow
    if (cur_color == DARK_YELLOW) {
      state.set("rgb", default_color);
    } else {
      state.set("rgb", DARK_YELLOW);
    }
    // Jump up and down
    if (position[2] == 1) {
      position[2] = 4;
    } else {
      position[2] = 1;
    }
  } else {
    state.set("rgb", default_color);
    if (position[2] != 1) {
      position[2] = 1;
    }
  }
  if (is_victim_of_violent_crime || is_victim_of_property_crime || is_committing_violent_crime || is_committing_property_crime || going_to_commit_crime != "none") {
  } else {
    position = wander(position, a_start - 1, b_start - 1, a_end + 1, b_end + 1, 1);
  }
  // Make sure crime rates do not extreme
  if (violent_crime_adj > 1) {
    violent_crime_adj = 1;
  }
  if (property_crime_adj > 1) {
    property_crime_adj = 1;
  }
  crime_score = ((violent_crime_adj * impact_crime.violent_crime_adjuster) + (property_crime_adj * impact_crime.property_crime_adjuster)) / 2;
  state.set("position", position);
  state.set("violent_crime_adj", violent_crime_adj);
  state.set("property_crime_adj", property_crime_adj);
  state.set("crime_score", crime_score);
  state.set("is_victim_of_violent_crime", is_victim_of_violent_crime);
  state.set("is_victim_of_property_crime", is_victim_of_property_crime);
  state.set("crime_source_id", crime_source_id);
  state.set("crime_source_race", crime_source_race);
  state.set("is_committing_violent_crime", is_committing_violent_crime);
  state.set("is_committing_property_crime", is_committing_property_crime);
  state.set("crime_target_id", crime_target_id);
  state.set("called_police", called_police);
  state.set("going_to_commit_crime", going_to_commit_crime);
  state.set("recent_police_interactions", recent_police_interactions);
  state.set("police_impression", police_impression);
  return state;
}
