// Calculate excessive force multiplier given the crime_score of the neighborhood
function ef_multiplier(crime_score) {
  if (crime_score > 1) {
    crime_score = 1;
  }
  // Excessive force is tiny percentage
  // Crime score is number from 0 to 1
  return (crime_score * 2); // TO-DO: Replace with more complicated function
  // This just makes it so if it's a super bad neighborhood, the chances of ef are doubled, while if it's a super good neighborhood, ef chances are 0
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
    // Already at target
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
  // Make sure not to overshoot / zig-zag
  if (orig_x < destination[0] && position[0] > destination[0]) {
    position[0] = destination[0]; 
  } else if (orig_x > destination[0] && position[0] < destination[0]) {
    position[0] = destination[0];
  }
  if (orig_y < destination[1] && position[1] > destination[1]) {
    position[1] = destination[1]; 
  } else if (orig_y > destination[1] && position[1] < destination[1]) {
    position[1] = destination[1];
  }
  return position;
}

function findClosestBlockPoint(position, a_start, b_start, a_end, b_end) {
  if (position[0] <= a_start && position[1] <= b_start) {
    return [a_start, b_start]; // Top left corner
  } else if (position[0] <= a_start && position[1] >= b_end) {
    return [a_start, b_end]; // Bottom left corner
  } else if (position[0] >= a_end && position[1] >= b_end) {
    return [a_end, b_end]; // Bottom right corner
  } else if (position[0] >= a_end && position[1] <= b_start) {
    return [a_end, b_start]; // Top right corner
  } else { // Current position's closest point is somewhere else
    if (position[0] <= a_start) {
      return [a_start, position[1]];
    } else if (position[0] >= a_end) {
      return [a_end, position[1]];
    } else if (position[1] <= b_start) {
      return [position[0], b_start];
    } else if (position[1] >= b_end) {
      return [position[0], b_end];
    } else {
      console.log("Error in finding closest block point");
      return position;
    }
  }
}

function travelToBlock(position, a_start, b_start, a_end, b_end, speed) {
  return travelToPoint(position, findClosestBlockPoint(position, a_start, b_start, a_end, b_end), speed);
}

function behavior(state, context) {
  const { topology, pd, community } = context.globals();
  const x_bounds = topology.x_bounds[1];
  const y_bounds = topology.y_bounds[1];
  let position = state.get("position");
  let agent_name = state.get("agent_name");
  let idling = state.get("idling");
  let cur_caller_id = state.get("cur_caller_id");
  let cur_criminal_id = state.get("cur_criminal_id");
  let cur_criminal_race = state.get("cur_criminal_race");
  let cur_caller_position = state.get("cur_caller_position");
  let cur_caller_crime_score = state.get("cur_caller_crime_score");
  let a_start = state.get("a_start");
  let b_start = state.get("b_start");
  let a_end = state.get("a_end");
  let b_end = state.get("b_end");
  let returning_to_hq = state.get("returning_to_hq");
  let closest_hq_position = state.get("closest_hq_position");
  let excessive_force_white = state.get("excessive_force_white");
  let excessive_force_black = state.get("excessive_force_black");
  let excessive_force_amerindian = state.get("excessive_force_amerindian");
  let excessive_force_asian = state.get("excessive_force_asian");
  let excessive_force_hawaiian = state.get("excessive_force_hawaiian");
  let excessive_force_other_race = state.get("excessive_force_other_race");
  // Determine if police are being called
  // Police should only have one call message at a time, because police_operator processes all the calls
  const crime_calls = context.messages().filter(msg => msg.type === "crime_call");
  crime_calls.forEach(m => 
    {
      idling = false;
      cur_caller_id = m.data.caller_id; 
      cur_criminal_id = m.data.crime_source_id;
      cur_criminal_race = m.data.criminal_race;
      cur_caller_position = m.data.caller_position;
      cur_caller_crime_score = m.data.crime_score;
    }
  ); 
  if (idling) {
    position = wander(position, a_start - 1, b_start - 1, a_end + 1, b_end + 1, 1);
  } else if (returning_to_hq) {
    if (stepsBetween(position, closest_hq_position) > 0) {
      position = travelToPoint(position, closest_hq_position, 3);
    } else {
      // Send message to police operator that this officer is back and idling
      state.addMessage(
        "police_operator", 
        "officer_returned", 
        {
          msg: "Officer " + agent_name + " has returned from call", 
          officer: agent_name
        }
      )
      idling = true;
      returning_to_hq = false; 
      closest_hq_position = [-1, -1, -1];
    }
  } else {
    // Agent is on duty and has a task
    if (stepsBetween(position, cur_caller_position) > 3) {
      position = travelToPoint(position, cur_caller_position, 3);
    } else if (stepsBetween(position, cur_caller_position) > 1) {
      position = travelToPoint(position, cur_caller_position, 1);
    } else {
      // Break up the crime by sending message to criminal and caller
      // First, determine if excessive force will be used
      var temp = Math.random(); 
      var excessive_force = false;
      eval("var cur_chance_excessive_force = excessive_force_" + cur_criminal_race + ";");
      cur_chance_excessive_force = cur_chance_excessive_force * ef_multiplier(cur_caller_crime_score);
      if (temp < cur_chance_excessive_force) {
        // Officer will use excessive force
        excessive_force = true;
        console.log("Officer " + agent_name + " has applied excessive force against a " + cur_criminal_race + " civilian!");
      }
      state.addMessage(
        cur_caller_id, 
        "end_crime_for_caller", 
        {
          msg: "Resolving crime for caller " + cur_caller_id, 
          excessive_force: excessive_force
        }
      );
      state.addMessage(
        cur_criminal_id, 
        "end_crime_for_criminal", 
        {
          msg: "Resolving crime for criminal " + cur_criminal_id, 
          excessive_force: excessive_force
        }
      );
      // Reset call info
      cur_caller_id = "nobody"; 
      cur_criminal_id = "nobody"; 
      cur_criminal_race = "n/a";
      cur_caller_position = [-1, -1, -1];
      cur_caller_crime_score = -1;
      // Return to police HQ
      returning_to_hq = true;
      closest_hq_position = findClosestBlockPoint(position, a_start, b_start, a_end, b_end);
    }
  }
  state.set("position", position);
  state.set("idling", idling);
  state.set("cur_caller_id", cur_caller_id);
  state.set("cur_criminal_id", cur_criminal_id);
  state.set("cur_criminal_race", cur_criminal_race);
  state.set("cur_caller_position", cur_caller_position);
  state.set("cur_caller_crime_score", cur_caller_crime_score);
  state.set("returning_to_hq", returning_to_hq);
  state.set("closest_hq_position", closest_hq_position);
  return state;
}
