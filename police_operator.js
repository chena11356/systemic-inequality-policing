function getRandomInt(min, max) {
  return Math.floor(Math.random() * Math.floor(max - min)) + min;
}

// Receives calls for service, and assigns them to random available police officer
const behavior = (state, context) => {
  let officer_statuses = state.get("officer_statuses");
  let num_officers = state.get("num_officers");
  let calls_backlog = state.get("calls_backlog");
  let available_officers = [];
  const crime_calls = context.messages().filter(msg => msg.type === "crime_call");
  const officers_returned = context.messages().filter(msg => msg.type === "officer_returned");
  officers_returned.forEach(m => {
    // Adjust officer_statuses
    for (var i = 0; i < num_officers; i++) {
      if (officer_statuses[i].agent_name == m.data.officer) {
        officer_statuses[i].idling = true; 
        officer_statuses[i].caller_id = "nobody"; 
        officer_statuses[i].criminal_id = "nobody"; 
        officer_statuses[i].caller_position = [-1, -1, -1]; 
        officer_statuses[i].crime_score = -1;
        officer_statuses[i].criminal_race = "n/a"; 
      }
    }
  });
  officer_statuses.forEach(officer => {
    if (officer.idling) {
      available_officers.push(officer);
    }
  });
  let cur_officer = "nobody";
  let temp = -1;
  // Assign calls from backlog
  calls_backlog.forEach(m => {
    if (available_officers.length <= 0) {
      // Can't do much
    } else {
      // Assign the call to a random officer
      temp = getRandomInt(0, available_officers.length);
      cur_officer = available_officers[temp].agent_name;
      // Remove officer from list of available officers
      available_officers.splice(temp, 1);
      // Adjust officer_statuses
      for (var i = 0; i < num_officers; i++) {
        if (officer_statuses[i].agent_name == cur_officer) {
          officer_statuses[i].idling = false; 
          officer_statuses[i].caller_id = m.from; 
          officer_statuses[i].criminal_id = m.data.crime_source_id; 
          officer_statuses[i].caller_position = m.data.caller_position; 
          officer_statuses[i].crime_score = m.data.crime_score;
          officer_statuses[i].criminal_race = m.data.crime_source_race;
        }
      }
      // Notify officer that they are needed for this call
      state.addMessage(
        cur_officer, 
        "crime_call", 
        {
          msg: "Call has been routed to " + cur_officer + "!", 
          caller_id: m.from,
          caller_position: m.data.caller_position, 
          crime_score: m.data.crime_score,
          crime_source_id: m.data.crime_source_id, 
          criminal_race: m.data.crime_source_race
        }
      );
    }
  });
  // Assign calls from active calls
  crime_calls.forEach(m => 
    {
      if (available_officers.length <= 0) {
        calls_backlog.push(m);
      } else {
        // Assign the call to a random officer
        temp = getRandomInt(0, available_officers.length);
        cur_officer = available_officers[temp].agent_name;
        // Remove officer from list of available officers
        available_officers.splice(temp, 1);
        // Adjust officer_statuses
        for (var i = 0; i < num_officers; i++) {
          if (officer_statuses[i].agent_name == cur_officer) {
            officer_statuses[i].idling = false; 
            officer_statuses[i].caller_id = m.from; 
            officer_statuses[i].criminal_id = m.data.crime_source_id; 
            officer_statuses[i].caller_position = m.data.caller_position; 
            officer_statuses[i].crime_score = m.data.crime_score;
            officer_statuses[i].criminal_race = m.data.crime_source_race;
          }
        }
        // Notify officer that they are needed for this call
        state.addMessage(
          cur_officer, 
          "crime_call", 
          {
            msg: "Call has been routed to " + cur_officer + "!", 
            caller_id: m.from,
            caller_position: m.data.caller_position, 
            crime_score: m.data.crime_score,
            crime_source_id: m.data.crime_source_id,
            criminal_race: m.data.crime_source_race
          }
        );
      }
    }
  );
  state.set("officer_statuses", officer_statuses);
  state.set("calls_backlog", calls_backlog);
  return state;
};
