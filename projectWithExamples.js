// var viz = webpplViz;

/* ###################
 * # Our model thing #
 * ###################
 */

/*
 * How to read arrays:
 *
 *  First, we explain how to read valuations.
 *  Here, we suppose there is a canonical ordering of valuations.
 *  For example: [PQ, P-, -Q, --].
 *  A valuation is then a number corresponding to the index of the valuation.
 *  So, 3 would be the valuation where P and Q are both false.
 *
 *  For the accessibility constraints, position(i, j) = 1 if from valuation i
 *  the player can get to valuation j.
 *  Otherwise position(i, j) = 0.
 *
 *  [1, 1, 0, 0],
 *  [1, 1, 0, 0],
 *  [0, 0, 1, 1],
 *  [0, 0, 1, 1]
 *
 *  In the above matrix, only the valuation of Q can be changed.
 */



/* Function: agentMove
 * Usage: condition(agentMove(valuation, constraints, preference) === valuation)
 * -----------------------------------------------------------------------------
 * The agent takes considers a valuation, constraints on the changes they can
 * make, and a preference order. They return a valuation, corresponding to the
 * change they enact on the world, or whatever.
 */

var agentMove = function(valuation, constraint, preference) {
    return returnValuation(valuation, constraint, preference, 0);
};

/* Function: returnValuation
 * Usage: return returnValuation(valuation, constraint, preference, 0)
 * -------------------------------------------------------------------
 * returnValuation returns the valuation chosen by the agent.
 * The function is recursive, checking for each preference whether there
 * is a valuation which the player can reach which satisfies their preference
 * (So, the function moves down the preference order)
 * It then returns a choice from the accessible, preferred, valuation.
 * (Such a valuation is guaranteed to exist, as [1,1,1,1] will always be an
 * element of the agent's preference ordering.)
 */

var returnValuation = function(valuation, constraint, preference, n) {
    if (n < preference.length) {
        var w = agentChoice(valuation, getAccessibleValuations
                            (constraint[valuation], preference[n]));
        if (w !== null) {
            return w;
        } else {
            return returnValuation(valuation, constraint, preference, n + 1);
        }
    } else {
        return valuation;
    }
};

/* Function: agentChoice
 * Usage: var w = agentChoice(valuation, accessible valuations)
 * ------------------------------------------------------------
 * agentChoice either runs the return choice algorithm, or states that
 * there are no accessible preferred valuations.
 */

var agentChoice = function(valuation, accessibleVal) {
    if (accessibleVal.indexOf(1) === -1) {
        return null;
    } else {
    return choiceAlg(valuation, accessibleVal);
  }
};

/* Function: choiceAlg
 * Usage: return choiceAlg(valuation, accessible valuations)
 * ---------------------------------------------------------
 * choiceAlg is where the 'magic' happens.
 * choiceAlg samples from a categorical after finding the valuations that the
 * agent  cares about, and weighting them appropriately.
 */

var choiceAlg = function(valuation, accessibleVal) {
    var goodVals = getGoodVals(accessibleVal, 0);
    var weights = getWeights(goodVals, valuation, 0);
    return sample(Categorical({ps: weights, vs: goodVals}));
};

/* Function: getGoodVals
 * Usage: var goodVals = getGoodVals(accessible valuations, 0)
 * -----------------------------------------------------------
 * getGoodVals takes array of bits (e.g. [1,1,0,1], returns array of positions
 * of 1s (e.g. [0,1,3]).
 */

var getGoodVals = function(accessibleVal, n) {
    if (n >= accessibleVal.length) {
        return [];
  } else if (accessibleVal[n] == 1) {
    return [n].concat(getGoodVals(accessibleVal, n + 1));
  } else {
    return getGoodVals(accessibleVal, n + 1);
  }
};


/* Function getWeights
 * Usage: var weights = getWeights(goodVals, valuation, 0)
 * -------------------------------------------------------
 * getWeights is where the *magic* happens.
 * Takes array of good valuations (e.g. [0,1,3]) and current valuation (e.g. 1),
 * returns array of weights (e.g. [1,10,1])
 */

// Fun stuff to do here
var getWeights = function(goodVals, valuation, n) {
  if (n >= goodVals.length) {
    return [];
  } else {
    if (goodVals[n] == valuation) {
      return [1].concat(getWeights(goodVals, valuation, n + 1));
    } else {
      return [1].concat(getWeights(goodVals, valuation, n + 1));
    }
  }
};

/*
 * The following has things to tweak (can an agent make mistakes about what
 * they prefer?).
 * Given contraints constraints and preferred set of valuations preferences,
 * returns set of accessible and preferred valuations.
 */

/* Function getAccessibleValuations
 * Usage: agentChoice(valuation, getAccessibleValuations(constraint[valuation],
 *                                                       preference[n]))
 * -----------------------------------------------------------------------------
 * Returns accessible valuations given a valuation and the intersection of the
 * constraints on that valuation and a particular valuation in an agent's
 * preference order.
 */


var getAccessibleValuations = function(constraints, preferences) {
  if (constraints.length === 0 || preferences.length === 0) {
    return [];
  } else {
      let p = [constraints[0] * preferences[0]].concat(getAccessibleValuations
                                                       (constraints.slice
                                                        (1, constraints.length),
                                                        preferences.slice
                                                        (1, preferences.length))
                                                      );
      return p;
  }
};

/* --------------- */
/* Data Generation */
/* --------------- */

/*
 * Function: getData
 * Usage: Unused | getaData(m, l, constraints, prefs, n)
 * ----------------------------------------------------
 * Returns an array [n,m] where n and m are valuations  such that m is
 * accessible from n, given constraints and preferences?
 */

var getData = function(m, l, constraints, prefs, n) {
  if (n >= m) {
    return [];
  } else {
      var inV = sample(RandomInteger({n: l}));
      return [[inV, returnValuation(inV, constraints, prefs, 0)]].concat(
          getData(m, l, constraints, prefs, n + 1));
  }
};

/* --------------------- */
/* Preference Generation */
/* --------------------- */

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* General pref order functions */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/*  First, a function which produces a string of 0s to a specified length */

/*
 * Function: zeroes
 * Usage: zeroes(number of zeroes).concat(binary rep of number)
 * ------------------------------------------------------------
 * Generates a string of 0s of a specified length
 */

var zeroes = function(num, n) {
    if (n == num) {
        return "";
    } else {
        zeroes(num, n + 1).concat("0");
    }
};

/*
 * Now, to generate the preference order,

 */

/*
 * Function: genValByNum
 * Usage: Unused | genValByNum(number of atoms)
 * -------------------------------------------
 * Generates a valuation for a formula
 * given a number of atoms.
 * we create a random binary string such that
 * the length of the string will not exceed the
 * length of the order.  To find the right number,
 * we simply need to raise two to the length of the string.
 * To avoid strings of 1s and 0s, we then subtract 2 from the result
 * and then increase the random number by 1 (ensuring 0 never occurs).
 * As the string may not be long enough, we prefix it with any required 0s.
 */

var genValByNum = function(atoms) {
    var states = Math.pow(2, atoms);
    var randNum = ((sample(RandomInteger(
        {n: Math.pow(2, states) - 2}))) + 1).toString(2);
    return (zeroes(states - randNum.length, 0).concat(randNum)).split("");
};

/*
 * Function: StrArrtoIntArr
 * Usage: return StrArrtoIntArr(array, n)
 * ----------------------------
 * Turns an array of strings of integers
 * into an array of integers via recursion.
 * This is used due to the fact that genValByNum
 * returns an array of '0's and '1's, not 0s and 1s.
 */

var StrArrtoIntArr = function(array, n) {
    if (n >= (array.length)) {
        return [];
    } else {
        StrArrtoIntArr(array, n + 1).concat(~~(array[n]));
    }
};

/*
 * Function: genValArrayByNum
 * Usage: [genValArrayByNum(atoms)]
 * ----------------------------
 * Generates an array of valuations  given a number of atoms.
 * (Combines the above functions.)
 */

var genValArrByNum = function(atoms) {
    var states = Math.pow(2, atoms);
    var randNum = ((sample(RandomInteger(
        {n: Math.pow(2, states) - 2}))) + 1).toString(2);
    var pref = (zeroes(states - randNum.length, 0).concat(randNum)).split("");
    return StrArrtoIntArr(pref, 0);
}

/*
 * Function: genTrivVal
 * Usage: [genTrivVal(atoms)]
 * ----------------------------
 * Generates the trivial array  given a number of atoms.
 */

var genTrivVal = function(atoms) {
    var states = Math.pow(2, atoms);
    return StrArrtoIntArr((Math.pow(2, states) - 1).toString(2).split(""), 0);
};

/*
 * Function: genPrefOrder
 * Usage: prefAss = genPrefOrder(atoms, max length)
 * --------------------------------------
 * The most basic way to generate a preference order given some number of atoms.
 * Randomly adds a valuation up to a maximum length.
 Allows for repetition, etc. flip makes longer order less likely.
*/

var genPrefOrder = function(atoms, n, max) {
    if (n == max) {
        return [genTrivVal(atoms)];
    } else {
        flip(Math.pow((max - n) / max, 2)) ? ([genValArrByNum(atoms)]).concat(
            genPrefOrder(atoms, n + 1, max)) : [genTrivVal(atoms)];
    }
};


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* Functions for generating preferences from restricted orders */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* We specify a table of all permissible vals, such as below, which we use for
 * the following restricted functions.
 */

/*
 * var permissibleVals = [
 *   [0,1,0,0],
 *   [0,0,1,0],
 *   [1,0,0,0],
 *   [1,1,1,0],
 *   [0,1,1,0],
 *   // [1.1.1.1]
 * ]
 */

/*
 * Function: genRestrictedVal
 * Usage: [genRestrictedVal(permitted valuations)]
 * ---------------------------------------------
 * Takes an array of permitted valuations and samples
 * one of them.
 */

var genRestrictedVal = function (permittedPrefs) {
    return permittedPrefs[sample(RandomInteger({ n: permittedPrefs.length}))];
};

/*
 * Function: genRestrictedPrefOrder
 * Usage: prefAss = genRestrictedPrefOrder(permitted valuations, n, max)
 * -----------------------------------------------------------
 * Another way to generate a preference order.
 * Randomly adds a permissible valuation up to a maximum length.
 * Allows for repetition, etc.
 * flip makes longer order less likely.
 */

var genRestrictedPrefOrder = function (permittedPrefs, n, max) {
    if (n == max) {
        return [genTrivVal(2)];
    } else {
        flip(Math.pow((max - n) / max, 2)) ?
            ([genRestrictedVal(permittedPrefs)]).concat(
                genRestrictedPrefOrder
                (permittedPrefs, n + 1, max)) : [genTrivVal(2)];
    }
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* Functions for generating preference orders from weights */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/*
 * Function: adjustWeights
 * Usage: mapObject(adjustWeight(preference order), weighted valuations)
 * ---------------------------------------------------------------------
 * Takes a preference order and returns a function specifying how
 * to adjust the weight of an order:weight object.
 *
 * At present the function looks at the last element of the preference
 * order only.
 * If it is the trivial valuation, then it sets everything to 1.
 * This allows us to 'reset' the weights when we have a completed order and
 * no longer have any use for the order:weight object.
 *
 * And, if an valuation has just been added to an order, it then gives that
 * valuation weight 0 for future samples.
 *
 * Otherwise, it changes the weight of the order based on hardcoded presets.
 *
 * If we have an exclusive or, we demote the weight of an inclusive or,
 * and vice versa.
 * Id we have an conjucntion, then we demote the weight of an inclusive or.
 *
 * We can also increase weights by using  Math.min(weight * increase, 1)
 * which caps the max weight at 1.
 *
 * We also assume that the trivial valiation is given weight 0 to begin
 * with, and adjust this weight for subsequent samples.
 * And a similar thing happens with the max length of the order.
 * If the length is greater than some number, everything but the trivial
 * valuation is given weight 0, while the trivial gets weight 1.
 */

var adjustWeights = function(prefOrder) {
    return function (valuation, weight) {
        var lastPrefElement = prefOrder[_.size(prefOrder)-1];

        if (JSON.stringify(lastPrefElement) === JSON.stringify(genTrivVal(2))) {
            return 0;
        } else if (_.size(prefOrder) >= 3) {
            if (valuation === JSON.stringify(genTrivVal(2))) {
                return 1;
            } else {
                return 0;
            }
        } else {
            if (valuation === (JSON.stringify(lastPrefElement))) {
                return 0;
            }
            // if (JSON.stringify(lastPrefElement) === JSON.stringify([0,1,1,0])) {
            //     if (valuation === JSON.stringify([1,1,1,0])) {
            //         return weight * .25;
            //     }
            // }
            // if (JSON.stringify(lastPrefElement) === JSON.stringify([1,1,1,0])) {
            //     if (valuation === JSON.stringify([0,1,1,0])) {
            //         return weight * .25;
            //     };
            // }
            // if (JSON.stringify(lastPrefElement) === JSON.stringify([1,0,0,0])) {
            //     if (valuation === JSON.stringify([1,1,1,0])) {
            //         return weight * .25;
            //     };
            // }
            if (true) {
                if (valuation === JSON.stringify(genTrivVal(2))) {
                    return 1;
                }
            }
        };
        return weight;
    };
};




/* Function: genPrefOrderfromweights
 * Usage: prefAss = genPrefOrderfromweights(current prefs, weighted vals)
 * ----------------------------------------------------------------------
 * Another way to generate a preference order.
 * It samples from an distribution over valuations based on their
 * given weight, and adds the valuation to the preference order given.
 * Each time there is a chance to sample the trivial valuation, and once
 * this has been sampled, the function returns a preference order.
 *
 * We may want to add a maximum possible length of the order, which would
 * be a straightforward matter of adding two parameters, one for the max,
 * and the other for determining how many times the function has been called.
 */

var genPrefOrderFromWeights = function (currentPrefs, valWeights) {
    var newVal = sample(Categorical(
        {ps:_.values(valWeights), vs:_.keys(valWeights)}));
    currentPrefs.push(newVal);
    if (_.isEqual(newVal, JSON.stringify(genTrivVal(2)))) {
        return currentPrefs;
    } else {
        var newValWeights = mapObject(adjustWeights(currentPrefs), valWeights);
        return genPrefOrderFromWeights(currentPrefs, newValWeights);
    };
};

var globalGenPrefOrderFromWeights = function (currentPrefs) {

    var newVal = sample(Categorical({ps:_.values(globalStore.weightedVals),
                                     vs:_.keys(globalStore.weightedVals)}));
    var newPrefs = currentPrefs.concat([JSON.parse(newVal)]);

    if ((newVal === JSON.stringify(genTrivVal(2)))) {
        return newPrefs;
    } else {
        globalStore.weightedVals = mapObject(adjustWeights(newPrefs),
                                             globalStore.weightedVals);
        return globalGenPrefOrderFromWeights(newPrefs);
    };
};




/* Do we want a Poisson distribution in the genPrefOrder function? */

/* --------- */
/* Inference */
/* --------- */

/*
 * Function: inferPreference
 * Usage: inferPreference(observation, constraint, atoms)
 * ------------------------------------------------------
 * Infers a preference order from a sequence of observations of the form [n,m],
 * where n and m are valuations and a constraint specifying the permissible
 * transitions between valuations. The number of atoms must also be specified.
 */

var inferPreference = function(observedChoice, constraint, atoms) {
    var model = function() {

        var prefAss = genPrefOrder(atoms, 0, 2);

        var obsFn = function(datum) {
            condition(agentMove(datum[0], constraint, prefAss) == datum[1]);
        };
        mapData({data: observedChoice}, obsFn);
        return prefAss;
    };
    return Infer({
        // method: 'rejection',
        // samples: 10000,

        // method: 'MCMC',
        // samples: 100000,
        // // lag: 5,
        // // burn : 10,
        // verbose: true,

        // method: 'SMC',
        // particles: 10000,
        // rejuvSteps: 0,

        method: 'enumerate',
        // strategy: 'depthFirst',
        // maxExecutions: 100000,

        model: model
    });
};

/*
 * Function: inferPreferenceWithVaryingConstraints
 * Usage: inferPreferenceWithVaryingConstraints(observation, atoms)
 * ----------------------------------------------------------------
 * Infers a preference order from a sequence of observations
 * of the form [n, c, m], where n and m are valuations and c is
 * a constraint specifying the permissible transitions between
 * valuations.
 * The number of atoms must also be specified.
 */

var inferPreferenceWithVaryingConstraints = function (observation, atoms) {
    var model = function() {
        var prefAss = genPrefOrder(atoms, 0, 2);

        var obsFn = function(datum) {
            condition(agentMove(datum[0], datum[1], prefAss) == datum[2]);
        };
        mapData({data: observation}, obsFn);
        return prefAss;
    };
    return Infer({
        // method: 'rejection',
        // samples: 1000,

        // method: 'MCMC',
        // samples: 1000,
        // // lag: 5,
        // // burn : 10,
        // verbose: true,

        // method: 'SMC',
        // particles: 1000,
        // rejuvSteps: 10,

        method: 'enumerate',
        // strategy: 'depthFirst',
        // strategy: 'likelyFirst',
        // strategy : 'breadthFirst',
        // maxExecutions: 1000,

        model: model
    });
};

/*
 * Function: inferRestrictedPreferenceWithVaryingConstraints
 * Usage: inferRestrictedPreferenceWithVaryingConstraints
 *                  (observation, permissible valuations)
 * -----------------------------------------------------------------------------
 * Infers a preference order from a sequence of observations
 * of the form [n, c, m], where n and m are valuations and c is
 * a constraint specifying the permissible transitions between
 * valuations.
 * The permissible valuations must also be specified (an array of valuations).
 * As the permissible valuations implicitly determine the number of atoms,
 * this number does not need to be fed as an argument.
 */

var inferRestrictedPreferenceWithVaryingConstraints =
    function(observation, restrictedPrefs) {
        var model = function() {
            var prefAss = genRestrictedPrefOrder(restrictedPrefs, 0, 3);
            var obsFn = function(datum) {
                condition(agentMove(datum[0], datum[1], prefAss) == datum[2]);
            };
            mapData({data: observation}, obsFn);
            return prefAss;
        };
        return Infer({
            // method: 'rejection',
            // samples: 1000,

            // method: 'MCMC',
            // samples: 1000,
            // // lag: 5,
            // // burn : 10,
            // verbose: true,

            // method: 'SMC',
            // particles: 1000,
            // rejuvSteps: 10,

            method: 'enumerate',
            // strategy: 'depthFirst',
            // strategy: 'likelyFirst',
            // strategy : 'breadthFirst',
            // maxExecutions: 1000,

            model: model
        });
};

/*
 * Function: inferWeightedPreferenceWithVaryingConstraints
 * Usage: inferWeightedPreferenceWithVaryingConstraints
 *                                         (observation, permissible valuations)
 * -----------------------------------------------------------------------------
 *
 */


var inferWeightedPreferenceWithVaryingConstraints =
    function(observation, restrictedPrefs) {
        var model = function() {
            var prefAss = globalGenPrefOrderFromWeights([]);
            var obsFn = function(datum) {
                condition(agentMove(datum[0], datum[1], prefAss) == datum[2]);
            };
            mapData({data: observation}, obsFn);
            return prefAss;
        };
        return Infer({
            // method: 'rejection',
            // samples: 1000,

            method: 'MCMC',
            samples: 100000,
            // // lag: 5,
            // // burn : 10,
            verbose: true,

            // method: 'SMC',
            // particles: 10000,
            // rejuvSteps: 10,

            // Enumerate doesn't seem to work here.
            // method: 'enumerate',
            // strategy: 'depthFirst',
            // strategy: 'likelyFirst',
            // strategy : 'breadthFirst',
            // maxExecutions: 1000,

            model: model
        });
};


/* ------------------ */
/* Data for modelling */
/* ------------------ */

/* ~~~~~~~~~~~ */
/* Constraints */
/* ~~~~~~~~~~~ */

var AisFixed = [
    [1, 1, 0, 1], // AB
    [1, 1, 0, 1], // A-
    [0, 0, 1, 1], // -B
    [0, 0, 1, 1]  // --
];

var noConstraints = [
    [1, 1, 1, 1], // AB
    [1, 1, 1, 1], // A-
    [1, 1, 1, 1], // -B
    [1, 1, 1, 1]  // --
];

var bothOrNeither = [
    [1, 0, 0, 1], // AB
    [0, 0, 0, 1], // A-
    [0, 0, 0, 1], // -B
    [1, 0, 0, 1]  // --
];

var onlyOneSet = [
    [0, 0, 0, 1], // AB
    [0, 1, 1, 1], // A-
    [0, 1, 1, 1], // -B
    [0, 1, 1, 1]  // --
];

var AUnavailable = [
    [0, 0, 1, 1], // AB
    [0, 0, 1, 1], // A-
    [0, 0, 1, 1], // -B
    [0, 0, 1, 1]  // --
];

var BUnavailable = [
    [0, 1, 0, 1], // AB
    [0, 1, 0, 1], // A-
    [0, 1, 0, 1], // -B
    [0, 1, 0, 1]  // --
];

/* ~~~~~~~~~~~~ */
/* Observations */
/* ~~~~~~~~~~~~ */

// Note, repetitions increase strength of inference.

var scenario0 = [
    [1 , noConstraints, 1], // Day 1
    [3 , noConstraints, 2], // Day 2
    [3 , bothOrNeither, 0], // Day 3
    [0 , noConstraints, 1], // Day 4
    [0 , bothOrNeither, 0], // Day 5
    [1 , noConstraints, 1], // Day 1
    [3 , noConstraints, 2], // Day 2
    [3 , bothOrNeither, 0], // Day 3
    [0 , noConstraints, 1], // Day 4
    [0 , bothOrNeither, 0], // Day 5
    [1 , noConstraints, 1], // Day 1
    [3 , noConstraints, 2], // Day 2
    [3 , bothOrNeither, 0], // Day 3
    [0 , noConstraints, 1], // Day 4
    [0 , bothOrNeither, 0], // Day 5
    [1 , noConstraints, 1], // Day 1
    [3 , noConstraints, 2], // Day 2
    [3 , bothOrNeither, 0], // Day 3
    [0 , noConstraints, 1], // Day 4
    [0 , bothOrNeither, 0], // Day 5
];

var scenario1 = [
    [3 , noConstraints, 0], // Day 1
    [1 , noConstraints, 0], // Day 2
    [2 , noConstraints, 0], // Day 3
    [3 , onlyOneSet, 1],    // Day 4
    [2 , onlyOneSet, 1],    // Day 5
    [3 , noConstraints, 0], // Day 1
    [1 , noConstraints, 0], // Day 2
    [2 , noConstraints, 0], // Day 3
    [3 , onlyOneSet, 1],    // Day 4
    [2 , onlyOneSet, 1],    // Day 5
    [3 , noConstraints, 0], // Day 1
    [1 , noConstraints, 0], // Day 2
    [2 , noConstraints, 0], // Day 3
    [3 , onlyOneSet, 1],    // Day 4
    [2 , onlyOneSet, 1],    // Day 5
    [3 , noConstraints, 0], // Day 1
    [1 , noConstraints, 0], // Day 2
    [2 , noConstraints, 0], // Day 3
    [3 , onlyOneSet, 1],    // Day 4
    [2 , onlyOneSet, 1],    // Day 5
];

var scenario2 = [
    [0 , noConstraints, 1], // Day 1
    [3 , noConstraints, 1], // Day 2
    [3 , AUnavailable, 2],  // Day 3
    [2 , noConstraints, 1], // Day 4
    [1 , AUnavailable, 2],  // Day 5
    [0 , noConstraints, 1], // Day 1
    [3 , noConstraints, 1], // Day 2
    [3 , AUnavailable, 2],  // Day 3
    [2 , noConstraints, 1], // Day 4
    [1 , AUnavailable, 2],  // Day 5
    [0 , noConstraints, 1], // Day 1
    [3 , noConstraints, 1], // Day 2
    [3 , AUnavailable, 2],  // Day 3
    [2 , noConstraints, 1], // Day 4
    [1 , AUnavailable, 2],  // Day 5
    [0 , noConstraints, 1], // Day 1
    [3 , noConstraints, 1], // Day 2
    [3 , AUnavailable, 2],  // Day 3
    [2 , noConstraints, 1], // Day 4
    [1 , AUnavailable, 2],  // Day 5
];

var scenario3 = [
    [2 , noConstraints, 0], // Day 1
    [1 , noConstraints, 0], // Day 2
    [1 , BUnavailable, 1],  // Day 3
    [3 , AUnavailable, 2],  // Day 4
    [3 , BUnavailable, 1],  // Day 5
    [2 , noConstraints, 0], // Day 1
    [1 , noConstraints, 0], // Day 2
    [1 , BUnavailable, 1],  // Day 3
    [3 , AUnavailable, 2],  // Day 4
    [3 , BUnavailable, 1],  // Day 5
    [2 , noConstraints, 0], // Day 1
    [1 , noConstraints, 0], // Day 2
    [1 , BUnavailable, 1],  // Day 3
    [3 , AUnavailable, 2],  // Day 4
    [3 , BUnavailable, 1],  // Day 5
    [2 , noConstraints, 0], // Day 1
    [1 , noConstraints, 0], // Day 2
    [1 , BUnavailable, 1],  // Day 3
    [3 , AUnavailable, 2],  // Day 4
    [3 , BUnavailable, 1],  // Day 5
];

var rationalProblems = [
    [0,1],
    [3,2],
    [1,1],
    [2,2]
];

var rationalProblemsForWeights = [
    [0,AisFixed,1],
    [3,AisFixed,2],
    [1,AisFixed,1],
    [2,AisFixed,2],
    [0,AisFixed,1],
    [3,AisFixed,2],
    [1,AisFixed,1],
    [2,AisFixed,2],
    [0,AisFixed,1],
    [3,AisFixed,2],
    [1,AisFixed,1],
    [2,AisFixed,2],
    [0,AisFixed,1],
    [3,AisFixed,2],
    [1,AisFixed,1],
    [2,AisFixed,2],
    [0,AisFixed,1],
    [3,AisFixed,2],
    [1,AisFixed,1],
    [2,AisFixed,2],
    [0,AisFixed,1],
    [3,AisFixed,2],
    [1,AisFixed,1],
    [2,AisFixed,2],
    [0,AisFixed,1],
    [3,AisFixed,2],
    [1,AisFixed,1],
    [2,AisFixed,2],
];

var rationalProblemsVarying = [
    [0,noConstraints,1],
    [3,AUnavailable,2],
    [1,onlyOneSet,1],
    [2,AUnavailable,2],
    [0,noConstraints,1],
    [3,AUnavailable,2],
    [1,onlyOneSet,1],
    [2,AUnavailable,2],
    [0,noConstraints,1],
    [3,AUnavailable,2],
    [1,onlyOneSet,1],
    [2,AUnavailable,2],
    [0,noConstraints,1],
    [3,AUnavailable,2],
    [1,onlyOneSet,1],
    [2,AUnavailable,2],
    [0,noConstraints,1],
    [3,AUnavailable,2],
    [1,onlyOneSet,1],
    [2,AUnavailable,2],
    [0,noConstraints,1],
    [3,AUnavailable,2],
    [1,onlyOneSet,1],
    [2,AUnavailable,2],
    [0,noConstraints,1],
    [3,AUnavailable,2],
    [1,onlyOneSet,1],
    [2,AUnavailable,2],
]

/* ~~~~~~~~~~~~~~~~~~~~~~ */
/* Permissible valuations */
/* ~~~~~~~~~~~~~~~~~~~~~~ */

var permissibleVals = [
    [0,1,0,0],
    [0,0,1,0],
    [1,0,0,0],
    [1,1,1,0],
    [0,1,1,0],
    [0,0,0,1],
];

/* ~~~~~~~~~~~~~~~~~~~ */
/* Weighted Valuations */
/* ~~~~~~~~~~~~~~~~~~~ */

/* Our weights always start at one. */

var wv01 = {
    "[0,1,1,0]" : 1,
    "[1,0,0,1]" : 1,
    "[1,0,0,0]" : 1,
    "[1,1,1,0]" : 1
};

var testOrder = [
    [0,1,0,0],
    [0,1,1,0],
    [1,0,0,0],
    [1,1,1,0],
    [0,1,1,0],
];

var examplePref = [
    [1,1,0,0],
    [1,0,0,0],
]

globalStore.weightedVals = {
    "[0,1,0,0]" : 1, // A~B
    "[0,0,1,0]" : 1, // ~AB
    "[1,0,0,0]" : 1, // A&B
    "[1,1,1,0]" : 1, // A|B
    "[0,1,1,0]" : 1, // AxB
    "[1,1,0,0]" : 1, // A
    "[1,0,1,0]" : 1, // B
    "[1,1,1,1]" : 0  // T
}

var weightedVals1 = {
    "[0,1,0,0]" : 1,
    "[0,0,1,0]" : 1,
    "[1,0,0,0]" : 1,
    "[1,1,1,0]" : 1,
    "[0,1,1,0]" : 1,
    "[1,1,1,1]" : 0
};

var tests = function() {
    // console.log(genPrefOrderFromWeights([],globalStore.weightedVals))
    // console.log(globalStore.weightedVals)
    // console.log(globalGenPrefOrderFromWeights([]))
    // console.log(mapObject(adjustWeights(examplePref), globalStore.weightedVals))
    // console.log(mapObject(adjustWeights(examplePref), weightedVals1))
    // mapObject(adjustWeights(examplePref), globalStore.weightedVals)
    // globalStore.weightedVals = mapObject(adjustWeights(examplePref), globalStore.weightedVals)
    // // globalStore.weightedVals = mapObject(adjustWeights(examplePref), globalStore.weightedVals)
    // display(globalStore.weightedVals)
    // console.log(globalStore.weightedVals)

    // console.log('Example:');
    // console.log(inferPreferenceWithVaryingConstraints(example, 2));
    // console.log('Scenario 1:');
    // console.log(inferPreferenceWithVaryingConstraints(scenario1, 2));
    // console.log('Scenario 2:');
    // console.log(inferPreferenceWithVaryingConstraints(scenario2, 2));
    // console.log('Scenario 3:');
    // console.log(inferPreferenceWithVaryingConstraints(scenario3, 2));


    // console.log("Scenarios run with basic model")
    // console.log('Scenario 0:');
    // console.log(inferRestrictedPreferenceWithVaryingConstraints(scenario0, permissibleVals));
    // console.log('Scenario 1:');
    // console.log(inferRestrictedPreferenceWithVaryingConstraints(scenario1, permissibleVals));
    // console.log('Scenario 2:');
    // console.log(inferRestrictedPreferenceWithVaryingConstraints(scenario2, permissibleVals));
    // console.log('Scenario 3:');
    // console.log(inferRestrictedPreferenceWithVaryingConstraints(scenario3, permissibleVals));

    console.log("With weights:")
    // console.log('Scenario 0:');
    // console.log(inferWeightedPreferenceWithVaryingConstraints(scenario0, permissibleVals));
    // console.log('Scenario 1:');
    // console.log(inferWeightedPreferenceWithVaryingConstraints(scenario1, permissibleVals));
    // console.log('Scenario 2:');
    // console.log(inferWeightedPreferenceWithVaryingConstraints(scenario2, permissibleVals));
    // console.log('Scenario 3:');
    // console.log(inferWeightedPreferenceWithVaryingConstraints(scenario3, permissibleVals));

    // console.log(_.size(wv01));
    // console.log(wv01);
    //
    console.log('Showing results of rational choice without constraints')
    console.log(inferWeightedPreferenceWithVaryingConstraints(rationalProblemsForWeights, 2))
    console.log('Showing results of rational choice without constraints')
    console.log(inferWeightedPreferenceWithVaryingConstraints(rationalProblemsVarying, 2))
};

tests();
