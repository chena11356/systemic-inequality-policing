const HIGH_VIOLENT_CRIME = 996; // In 2018, D.C. was the state with the highest violent crime rate (https://www.statista.com/statistics/200445/reported-violent-crime-rate-in-the-us-states/)
const LOW_VIOLENT_CRIME = 112; // In 2018, Maine was the state with the lowest violent crime rate (https://www.statista.com/statistics/200445/reported-violent-crime-rate-in-the-us-states/)
const HIGH_PROPERTY_CRIME = 4374; // In 2018, D.C. was the state with the highest property crime rate (https://www.statista.com/statistics/232575/property-crime-rate-in-the-us-by-state/)
const LOW_PROPERTY_CRIME = 1249; // In 2018, New Hampshire was the state with the lowest property crime rate (https://www.statista.com/statistics/232575/property-crime-rate-in-the-us-by-state/)

// TO-DO: Refactor and retrieve these stats from dataset
const pd_less_biased = 0.2;
const pd_normal_biased = 0.5;
const pd_extremely_biased = 0.3;

const pd_excessive_force_white_less_biased = 0.02;
const pd_excessive_force_black_less_biased = 0.02;
const pd_excessive_force_amerindian_less_biased	= 0.02;
const pd_excessive_force_asian_less_biased = 0.02;
const pd_excessive_force_hawaiian_less_biased	= 0.02;
const pd_excessive_force_other_race_less_biased	= 0.02;

const pd_excessive_force_white_normal_biased = 0.0102;
const pd_excessive_force_black_normal_biased = 0.0311;
const pd_excessive_force_amerindian_normal_biased = 0.021;
const pd_excessive_force_asian_normal_biased = 0.021;
const pd_excessive_force_hawaiian_normal_biased = 0.021;
const pd_excessive_force_other_race_normal_biased = 0.026;

const pd_excessive_force_white_extremely_biased = 0.001;
const pd_excessive_force_black_extremely_biased = 0.2;
const pd_excessive_force_amerindian_extremely_biased = 0.05;
const pd_excessive_force_asian_extremely_biased = 0.01;
const pd_excessive_force_hawaiian_extremely_biased = 0.05;
const pd_excessive_force_other_race_extremely_biased = 0.1;

const pd_less_violent	= 0.1;
const pd_normal_violent	= 0.7;
const pd_extremely_violent = 0.2;

const pd_less_violent_multiplier = 0.5; 	
const pd_normal_violent_multiplier = 1;
const pd_extremely_violent_multiplier = 2;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * Math.floor(max - min)) + min;
}

function pointFallsWithin(x, y, x_start, y_start, x_end, y_end) {
  if (x >= x_start && x <= x_end && y >= y_start && y <= y_end) {
    return true;
  } else {
    return false;
  }
}

function arrPointFallsWithin(arr, x, y) {
  var cur_c; 
  for (var i = 0; i < arr.length; i++) {
    cur_c = arr[i]; 
    if (pointFallsWithin(x, y, cur_c.a_start, cur_c.b_start, cur_c.a_end, cur_c.b_end)) {
      return i; 
    }
  }
  return -1;
}

function areasHaveOverlap(x_start, y_start, x_end, y_end, a_start, b_start, a_end, b_end) {
  if (
    pointFallsWithin(x_start, y_start, a_start, b_start, a_end, b_end) 
    || pointFallsWithin(x_start, y_end, a_start, b_start, a_end, b_end)
    || pointFallsWithin(x_end, y_start, a_start, b_start, a_end, b_end)
    || pointFallsWithin(x_end, y_end, a_start, b_start, a_end, b_end)
    || pointFallsWithin(a_start, b_start, x_start, y_start, x_end, y_end)
    || pointFallsWithin(a_start, b_end, x_start, y_start, x_end, y_end)
    || pointFallsWithin(a_end, b_start, x_start, y_start, x_end, y_end)
    || pointFallsWithin(a_end, b_end, x_start, y_start, x_end, y_end)
  ) {
    return true;
  } else {
    return false;
  }
}

function arrAreasHaveOverlap(arr, x_start, y_start, x_end, y_end) {
  var cur_c;
  for (var i = 0; i < arr.length; i++) {
    cur_c = arr[i]; 
    if (areasHaveOverlap(x_start, y_start, x_end, y_end, cur_c.a_start, cur_c.b_start, cur_c.a_end, cur_c.b_end)) {
      return true;
    }
  }
  return false;
}

function calculateColor(crime_score) {
  // Return a color, redder meaning more crime, green meaning less crime
  var r = Math.round(255 * crime_score); 
  var g = 255 - r;
  return [r, g, 0];
}

// Randomly determine race of community agent based on census data
function generateRace(white, black, amerindian, asian, hawaiian, other_race) {
  var temp = Math.random(); 
  black = white + black; 
  amerindian = black + amerindian; 
  asian = amerindian + asian; 
  hawaiian = asian + hawaiian; 
  other_race = hawaiian + other_race; 
  if (temp < white) {
    return "white";
  } else if (temp < black) {
    return "black";
  } else if (temp < amerindian) {
    return "amerindian";
  } else if (temp < asian) {
    return "asian";
  } else if (temp < hawaiian) {
    return "hawaiian";
  } else {
    return "other_race";
  }
}

// Randomly determine the racial bias of police agent, partially based on Police-Public Contact Survey data
function generateBias(less_biased, normal_biased, extremely_biased) {
  var temp = Math.random(); 
  normal_biased = less_biased + normal_biased;
  extremely_biased = normal_biased + extremely_biased; 
  if (temp < less_biased) {
    return "less_biased";
  } else if (temp < normal_biased) {
    return "normal_biased";
  } else {
    return "extremely_biased";
  }
}

// Randomly determine the violence of police agent
function generateViolence(less_violent, normal_violent, extremely_violent) {
  var temp = Math.random(); 
  normal_violent = less_violent + normal_violent;
  extremely_violent = normal_violent + extremely_violent; 
  if (temp < less_violent) {
    return "less_violent";
  } else if (temp < normal_violent) {
    return "normal_violent";
  } else {
    return "extremely_violent";
  }
}

// Randomly generate skin color based on agent's race
// Keeping in mind that race does not necessarily determine skin color
// (e.g. dark-skinned white people or light-skinned black people), this is 
// primarily for visual simplicity, with colors from emoji skin tones
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
  // Get globals
  const { topology, pd, community, impact_crime } = context.globals();
  const x_bounds = topology.x_bounds[1];
  const y_bounds = topology.y_bounds[1];
  // Initialize police dept and community seed data
  const dataset = context.data()["@chena11356/cincinnati2/cincinnati-precinct-2-police-and-community-data.json"];
  const cur_city = dataset.Sheet1[0];
  // Generate police dept in the center
  var pd_x_start = Math.round((x_bounds / 2) - (parseInt(cur_city.pd_size) / 2));
  var pd_y_start = Math.round((y_bounds / 2) - (parseInt(cur_city.pd_size) / 2));
  var pd_x_end = pd_x_start + parseInt(cur_city.pd_size);
  var pd_y_end = pd_y_start + parseInt(cur_city.pd_size);
  // Get random sets of coordinates generating each community
  var c_arr = [];
  // Push the police in as the first region
  var cur_c = {
    name: cur_city.name,
    raw_total_population: parseInt(cur_city.pd_raw_combined_neighborhood_population), 
    raw_num_officers: parseInt(cur_city.pd_raw_num_officers), 
    size: parseInt(cur_city.pd_size), 
    shift_length: parseFloat(cur_city.pd_shift_length), 
    shift_start_time: parseFloat(cur_city.pd_shift_start_time), 
    time_noncriminal_calls: parseFloat(cur_city.pd_time_noncriminal_calls),
    time_traffic: parseFloat(cur_city.pd_time_traffic),
    time_other: parseFloat(cur_city.pd_time_other),
    time_property: parseFloat(cur_city.pd_time_property),
    time_proactive: parseFloat(cur_city.pd_time_proctive),
    time_medical_other: parseFloat(cur_city.pd_time_medical_other),
    time_violent: parseFloat(cur_city.pd_time_violent),
    a_start: pd_x_start, 
    b_start: pd_y_start, 
    a_end: pd_x_end, 
    b_end: pd_y_end, 
    c_type: "police",
    rgb: [66, 139, 255], // Light blue
    agent_density: pd.pd_agent_density
  };
  c_arr.push(cur_c);
  // Generate communities from seed data
  var cur_c_name;
  var cur_c_raw_population;
  var cur_c_raw_population_density; 
  var cur_c_raw_land; 
  var cur_c_size; 
  var cur_c_agent_density; 
  var cur_c_violent_crime; 
  var cur_c_property_crime;
  var cur_c_white; 
  var cur_c_black; 
  var cur_c_amerindian; 
  var cur_c_asian;
  var cur_c_hawaiian; 
  var cur_c_other_race; 
  var cur_c_x_start;
  var cur_c_x_end; 
  var cur_c_y_start; 
  var cur_c_y_end;
  var cur_c_crime_score; // Between 0 and 1, based on comparing violent crime rates and property crime rates to national levels (assuming equal weight to violent and property crimes)
  var cur_c_violent_crime_adj;
  var cur_c_property_crime_adj; 
  var try_counter = 0;
  var err_thrown = false; 
  for (var i = 0; i < parseInt(cur_city.community_num); i++) {
    eval("cur_c_name = cur_city.community_name" + i + ";");
    eval("cur_c_raw_population = parseInt(cur_city.community_raw_population" + i + ");");
    eval("cur_c_raw_population_density = parseInt(cur_city.community_raw_population_density" + i + ");");
    eval("cur_c_raw_land = parseFloat(cur_city.community_raw_land" + i + ");");
    eval("cur_c_size = parseInt(cur_city.community_size" + i + ");");
    eval("cur_c_agent_density = parseFloat(cur_city.community_agent_density" + i + ");");
    eval("cur_c_violent_crime = parseInt(cur_city.community_violent_crime" + i + ");");
    eval("cur_c_property_crime = parseInt(cur_city.community_property_crime" + i + ");");
    eval("cur_c_white = parseFloat(cur_city.community_white" + i + ");");
    eval("cur_c_black = parseFloat(cur_city.community_black" + i + ");");
    eval("cur_c_amerindian = parseFloat(cur_city.community_amerindian" + i + ");");
    eval("cur_c_asian = parseFloat(cur_city.community_asian" + i + ");");
    eval("cur_c_hawaiian = parseFloat(cur_city.community_hawaiian" + i + ");");
    eval("cur_c_other_race = parseFloat(cur_city.community_other_race" + i + ");");
    cur_c_violent_crime_adj = cur_c_violent_crime / HIGH_VIOLENT_CRIME; 
    if (cur_c_violent_crime_adj > 1) {
      cur_c_violent_crime_adj = 1;
    }
    cur_c_property_crime_adj = cur_c_property_crime / HIGH_PROPERTY_CRIME; 
    if (cur_c_property_crime_adj > 1) {
      cur_c_property_crime_adj = 1;
    }
    cur_c_crime_score = (cur_c_violent_crime_adj + cur_c_property_crime_adj) / 2;
    cur_c_x_start = getRandomInt(0, x_bounds - cur_c_size);
    cur_c_y_start = getRandomInt(0, y_bounds - cur_c_size);
    cur_c_x_end = cur_c_x_start + cur_c_size; 
    cur_c_y_end = cur_c_y_start + cur_c_size;
    try_counter = 0; 
    while (arrAreasHaveOverlap(c_arr, cur_c_x_start, cur_c_y_start, cur_c_x_end, cur_c_y_end)) {
      cur_c_x_start = getRandomInt(0, x_bounds - cur_c_size);
      cur_c_y_start = getRandomInt(0, y_bounds - cur_c_size);
      cur_c_x_end = cur_c_x_start + cur_c_size; 
      cur_c_y_end = cur_c_y_start + cur_c_size;
      try_counter++; 
      if (try_counter > community.community_tries) {
        // Can't fit this neighborhood in
        console.log("Tried to generate community " + i + " and failed, expand bounds!");
        err_thrown = true; 
        break; 
      }
    }
    if (err_thrown) {
      return;
    }
    cur_c = {
      name: cur_c_name, 
      raw_population: cur_c_raw_population, 
      raw_population_density: cur_c_raw_population_density, 
      raw_land: cur_c_raw_land, 
      size: cur_c_size, 
      violent_crime: cur_c_violent_crime, 
      property_crime: cur_c_property_crime, 
      white: cur_c_white, 
      black: cur_c_black, 
      amerindian: cur_c_amerindian, 
      asian: cur_c_asian, 
      hawaiian: cur_c_hawaiian, 
      other_race: cur_c_other_race,
      a_start: cur_c_x_start, 
      b_start: cur_c_y_start, 
      a_end: cur_c_x_end, 
      b_end: cur_c_y_end, 
      c_type: "community", 
      rgb: calculateColor(cur_c_crime_score), 
      agent_density: cur_c_agent_density, 
      violent_crime_adj: cur_c_violent_crime_adj / impact_crime.violent_crime_adjuster, 
      property_crime_adj: cur_c_property_crime_adj / impact_crime.property_crime_adjuster, 
      crime_score: cur_c_crime_score
    };
    c_arr.push(cur_c);
  }
  console.log("List of communities:");
  console.log(c_arr);
  var cur_a_race; 
  var cur_a_color;
  var num_officers = 0;
  for (var i = 0; i < x_bounds; i++) {
    for (var j = 0; j < y_bounds; j++) {
      var k = arrPointFallsWithin(c_arr, i, j); 
      if (k != -1) {
        if (k == 0) { // Police dept tile
          state.addMessage("HASH", "create_agent", {
            position: [i, j], // based on location in dataset
            height: 1,
            rgb: c_arr[k].rgb,
            behaviors: ["police_patch.js"], 
            name: c_arr[k].name,
            raw_total_population: c_arr[k].raw_total_population, 
            raw_num_officers: c_arr[k].raw_num_officers, 
            type: "police_patch"
          });
        } else {
          state.addMessage("HASH", "create_agent", {
            position: [i, j], // based on location in dataset
            height: 1,
            rgb: c_arr[k].rgb,
            behaviors: ["community_patch.js"], 
            a_start: c_arr[k].a_start, 
            b_start: c_arr[k].b_start, 
            a_end: c_arr[k].a_end, 
            b_end: c_arr[k].b_end, 
            name: c_arr[k].name,
            raw_population: c_arr[k].raw_population, 
            raw_population_density: c_arr[k].raw_population_density, 
            raw_land: c_arr[k].raw_land, 
            violent_crime: c_arr[k].violent_crime, 
            property_crime: c_arr[k].property_crime, 
            violent_crime_adj: c_arr[k].violent_crime_adj, 
            property_crime_adj: c_arr[k].property_crime_adj, 
            crime_score: c_arr[k].crime_score,
            white: c_arr[k].white, 
            black: c_arr[k].black,
            amerindian: c_arr[k].amerindian,
            asian: c_arr[k].asian,
            hawaiian: c_arr[k].hawaiian,
            other_race: c_arr[k].other_race, 
            type: "community_patch"
          });
        }
        if (getRandomInt(0, 100) < (c_arr[k].agent_density * 100)) {
          // Generate agent
          if (k == 0) { // Police agent
            // First calculate shift start and end times
            var cur_shift_length = c_arr[k].shift_length;
            var cur_shift_start_time = c_arr[k].shift_start_time;
            var cur_shift_end_time = cur_shift_start_time + cur_shift_length; 
            if (cur_shift_end_time >= 24) {
              cur_shift_end_time -= 24;
            }
            var cur_bias = generateBias(pd_less_biased, pd_normal_biased, pd_extremely_biased); 
            var cur_violence = generateViolence(pd_less_violent, pd_normal_violent, pd_extremely_violent); 
            eval("var cur_excessive_force_white = pd_excessive_force_white_" + cur_bias + " * pd_" + cur_violence + "_multiplier;");
            eval("var cur_excessive_force_black = pd_excessive_force_black_" + cur_bias + " * pd_" + cur_violence + "_multiplier;");
            eval("var cur_excessive_force_amerindian = pd_excessive_force_amerindian_" + cur_bias + " * pd_" + cur_violence + "_multiplier;");
            eval("var cur_excessive_force_asian = pd_excessive_force_asian_" + cur_bias + " * pd_" + cur_violence + "_multiplier;");
            eval("var cur_excessive_force_hawaiian = pd_excessive_force_hawaiian_" + cur_bias + " * pd_" + cur_violence + "_multiplier;");
            eval("var cur_excessive_force_other_race = pd_excessive_force_other_race_" + cur_bias + " * pd_" + cur_violence + "_multiplier;");
            state.addMessage("HASH", "create_agent", {
              position: [i, j, 1], 
              rgb: [0, 75, 166], 
              search_radius: 15,
              race: "white",
              behaviors: ["police_agent.js"], 
              a_start: c_arr[k].a_start, 
              b_start: c_arr[k].b_start, 
              a_end: c_arr[k].a_end, 
              b_end: c_arr[k].b_end, 
              shift_length: cur_shift_length, 
              shift_start_time: cur_shift_start_time, 
              shift_end_time: cur_shift_end_time,
              time_noncriminal_calls: c_arr[k].time_noncriminal_calls, 
              time_traffic: c_arr[k].time_traffic, 
              time_other: c_arr[k].time_other, 
              time_property: c_arr[k].time_property, 
              time_proactive: c_arr[k].time_proactive, 
              time_medical_other: c_arr[k].time_medical_other,
              time_violent: c_arr[k].time_violent, 
              bias_white: pd.pd_bias_white, 
              bias_black: pd.pd_bias_black, 
              bias_amerindian: pd.pd_bias_amerindian, 
              bias_asian: pd.pd_bias_asian, 
              bias_hawaiian: pd.pd_bias_hawaiian, 
              bias_other_race: pd.pd_bias_other_race, 
              type: "police_agent", 
              agent_name: "police_agent" + num_officers, 
              idling: true, 
              cur_caller_id: "nobody", 
              cur_criminal_id: "nobody", 
              cur_criminal_race: "n/a",
              cur_caller_position: [-1, -1, -1], 
              cur_caller_crime_score: -1,
              returning_to_hq: false, 
              closest_hq_point: [-1, -1, -1], 
              bias: cur_bias, 
              violence: cur_violence, 
              excessive_force_white: cur_excessive_force_white, 
              excessive_force_black: cur_excessive_force_black, 
              excessive_force_amerindian: cur_excessive_force_amerindian, 
              excessive_force_asian: cur_excessive_force_asian, 
              excessive_force_hawaiian: cur_excessive_force_hawaiian, 
              excessive_force_other_race: cur_excessive_force_other_race
            });
            num_officers += 1;
          } else { // Community agent
            cur_a_race = generateRace(c_arr[k].white, c_arr[k].black, c_arr[k].amerindian, c_arr[k].asian, c_arr[k].hawaiian, c_arr[k].other_race);
            cur_a_color = generateColor(cur_a_race);
            state.addMessage("HASH", "create_agent", {
              position: [i, j, 1], 
              rgb: cur_a_color,
              search_radius: 15, 
              race: cur_a_race,
              behaviors: ["civilian_agent.js"], 
              community_id: k, 
              community_name: c_arr[k].name, 
              a_start: c_arr[k].a_start, 
              b_start: c_arr[k].b_start, 
              a_end: c_arr[k].a_end, 
              b_end: c_arr[k].b_end, 
              violent_crime_adj: c_arr[k].violent_crime_adj, 
              property_crime_adj: c_arr[k].property_crime_adj, 
              crime_score: c_arr[k].crime_score, 
              is_committing_violent_crime: false, 
              is_committing_property_crime: false,
              crime_target_id: "nobody", 
              is_victim_of_violent_crime: false, 
              is_victim_of_property_crime: false, 
              crime_source_id: "nobody",
              crime_source_race: "n/a",
              called_police: false,
              type: "civilian_agent", 
              going_to_commit_crime: "none", 
              recent_police_interactions: [], 
              police_impression: 0.5
            });
          }
        }
      } 
    }
  }
  let officer_statuses = []; 
  for (var i = 0; i < num_officers; i++) {
    officer_statuses.push({
      agent_name: "police_agent" + i,
      idling: true, 
      caller_id: "nobody", 
      criminal_id: "nobody", 
      caller_position: [-1, -1, -1], 
      criminal_race: "n/a", 
      crime_score: -1
    });
  }
  state.addMessage("HASH", "create_agent", {
    position: [0, 0],
    behaviors: ["police_operator.js"], 
    agent_name: "police_operator",
    type: "police_operator", 
    officer_statuses: officer_statuses, 
    num_officers: num_officers, 
    calls_backlog: [], 
    hidden: true
  });
  return state;
}
