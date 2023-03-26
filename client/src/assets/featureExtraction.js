const AA = 'ARNDCQEGHILKMFPSTWYV';
let DP = [];
for(let i = 0; i < 20; i++) {
    for(let j = 0; j < 20; j++) {
        DP.push(AA[i] + AA[j]);
	//DP.push(AA[j] + AA[i]);
    }
}

const AADict = {};
const DPCDict = {};

for (let i = 0; i < AA.length; i++) {
  AADict[AA[i]] = i;
}

let index = 0;
for (let i = 0; i < AA.length; i++) {
    for (let j = 0; j < AA.length; j++) {
        const pair = AA[i] + AA[j];
        DPCDict[pair] = index;
        index++;
    }
}

export const findFragments = (sequence, PSSM, windowSize, index) => {
        const fragments = [];
        const size = (windowSize - 1) / 2;
        for(let i = 0; i < sequence.length; i++) {
            if(sequence[i] === 'K') {
                let fr = sequence.slice(i - size, i + size + 1);
                if(fr.includes('X') || fr === '') {
                    continue;
                }
                
		//let fr = sequence.slice(i - size + 1, i + size + 1 + 1);

                // fragments.push({fr: fr, AAC: AAC(fr), DPC: DPC(fr), PCP: PCP(fr),KSPACE: KSPACE(fr), position: i - 1});
                fragments.push({fr: fr, EAAC: EAAC(fr), EGAAC: EGAAC(fr), BLOSUM: BLOSUM62(fr), position: i - 1});
            }
        }
        // PSSM ************************************************************************************************ uncomment to use pssm
        extractPSSM(PSSM[index], fragments, windowSize);
        // PSSM ************************************************************************************************
        return fragments;
    }

export const AAC = (fragment) => {
    // let aac = {};
    let aac = [];
    for(let i = 0; i < AA.length; i++) {
        let fa = fragment.split(AA[i]).length - 1;
        // if(fa !== 0)
        //     aac[AA[i]] = fa / fragment.length;
        aac[i] = fa / fragment.length;
    }
    return aac;
}

export const DPC = (fragment) => {
    // let dpc = {};
    let dpc = [];
    for(let i = 0; i < 400; i++) {
        let fd = fragment.split(DP[i]).length - 1;
        // if(fd !== 0)
             //dpc[DP[i]] = fd / (fragment.length - 1);
        dpc[i] = fd / (fragment.length - 1);
    	//dpc[i] = fd / (25);
    }

    //wrong, remove later
    //let temp = [];
    //for(let i = 0; i < 400; i++) {
	//temp.push(0);
    //}
    //for(let i = 0; i < AA.length; i++) {
	//for(let j = 0; j < fragment.length - 1; j++) {
	//	if(AA[i] == fragment[j]) {
	//		temp[(i)*20 + i] += 1/25;
	//	}
	//}
    //}
    return dpc;
    //return temp;
}

const pcpList = {
    A: [-0.21,0.78,13.4,52.6,0,-0.01,4.35,1.29,0.84,0.91,100,1.8,1.28,0.67,0,2.1],
    R: [2.11,1.58,8.5,109.1,52,0.04,4.38,1,1.04,1,65,12.5,2.34,-2.1,1,4.2],
    N: [0.96,1.2,7.6,75.7,3.38,0.06,4.75,0.81,0.66,1.64,134,-5.6,1.6,-0.6,0,7],
    D: [1.36,1.35,8.2,68.4,49.7,0.15,4.76,1.1,0.59,1.4,106,5.05,1.6,-1.2,-1,10],
    C: [-6.04,0.55,22.6,68.3,1.48,0.12,4.65,0.79,1.27,0.93,20,-16.5,1.77,0.38,0,1.4],
    Q: [1.52,1.19,8.5,89.7,3.53,0.05,4.37,1.07,1.02,0.94,93,6.3,1.56,-0.22,0,6],
    E: [2.3,1.45,7.3,84.7,49.9,0.07,4.29,1.49,0.57,0.97,102,12,1.56,-0.76,-1,7.8], 
    G: [0,0.68,7,36.3,0,0,3.97,0.63,0.94,1.51,49,0,0,0,0,5.7],
    H: [-1.23,0.99,11.3,91.9,51.6,0.08,4.63,1.33,0.81,0.9,66,-38.5,2.99,0.64,0,2.1],
    I: [-4.81,0.47,20.3,102,0.13,-0.01,3.95,1.05,1.29,0.65,96,12.4,4.19,1.9,0,-8],
    L: [-4.68,0.56,20.8,102,0.13,-0.01,4.17,1.31,1.1,0.59,40,-11,2.59,1.9,0,-9.2],
    K: [3.88,1.1,6.1,105.1,49.5,0,4.36,1.33,0.86,0.82,56,14.6,1.89,-0.57,1,5.7],
    M: [-3.66,0.66,15.7,97.7,1.43,0.04,4.52,1.54,0.88,0.58,94,-10,2.35,2.4,0,-4.2],
    F: [-4.65,0.47,23.9,113.9,0.35,0.03,4.66,1.13,1.15,0.72,41,-34.5,2.94,2.3,0,-9.2],
    P: [0.75,0.69,9.9,73.6,1.58,0,4.44,0.63,0.8,1.66,56,-86.2,2.67,1.2,0,2.1],
    S: [1.74,1,8.2,54.9,1.67,0.11,4.5,0.78,1.05,1.23,120,-7.5,1.31,0.01,0,6.5],
    T: [0.78,1.05,10.3,71.2,1.66,0.04,4.35,0.77,1.2,1.04,97,-28,3.03,0.52,0,5.2],
    W: [-3.32,0.7,24.5,135.4,2.1,0,4.7,1.18,1.15,0.67,18,-33.7,3.21,2.6,0,-10],
    Y: [-1.01,1,19.5,116.2,1.61,0.03,4.6,0.71,1.39,0.92,41,-10,2.94,1.6,0,-1.9],
    V: [-3.5,0.51,19.5,85.1,0.13,0.01,3.95,0.81,1.56,0.6,74,5.63,3.67,1.5,0,-3.7]
}

const blosum62_Dict = {
	'A': [4,  -1, -2, -2, 0,  -1, -1, 0, -2,  -1, -1, -1, -1, -2, -1, 1,  0,  -3, -2, 0],  // A
	'R': [-1, 5,  0,  -2, -3, 1,  0,  -2, 0,  -3, -2, 2,  -1, -3, -2, -1, -1, -3, -2, -3], // R
	'N': [-2, 0,  6,  1,  -3, 0,  0,  0,  1,  -3, -3, 0,  -2, -3, -2, 1,  0,  -4, -2, -3], // N
	'D': [-2, -2, 1,  6,  -3, 0,  2,  -1, -1, -3, -4, -1, -3, -3, -1, 0,  -1, -4, -3, -3], // D
	'C': [0,  -3, -3, -3, 9,  -3, -4, -3, -3, -1, -1, -3, -1, -2, -3, -1, -1, -2, -2, -1], // C
	'Q': [-1, 1,  0,  0,  -3, 5,  2,  -2, 0,  -3, -2, 1,  0,  -3, -1, 0,  -1, -2, -1, -2], // Q
	'E': [-1, 0,  0,  2,  -4, 2,  5,  -2, 0,  -3, -3, 1,  -2, -3, -1, 0,  -1, -3, -2, -2], // E
	'G': [0,  -2, 0,  -1, -3, -2, -2, 6,  -2, -4, -4, -2, -3, -3, -2, 0,  -2, -2, -3, -3], // G
	'H': [-2, 0,  1,  -1, -3, 0,  0,  -2, 8,  -3, -3, -1, -2, -1, -2, -1, -2, -2, 2,  -3], // H
	'I': [-1, -3, -3, -3, -1, -3, -3, -4, -3, 4,  2,  -3, 1,  0,  -3, -2, -1, -3, -1, 3],  // I
	'L': [-1, -2, -3, -4, -1, -2, -3, -4, -3, 2,  4,  -2, 2,  0,  -3, -2, -1, -2, -1, 1],  // L
	'K': [-1, 2,  0,  -1, -3, 1,  1,  -2, -1, -3, -2, 5,  -1, -3, -1, 0,  -1, -3, -2, -2], // K
	'M': [-1, -1, -2, -3, -1, 0,  -2, -3, -2, 1,  2,  -1, 5,  0,  -2, -1, -1, -1, -1, 1],  // M
	'F': [-2, -3, -3, -3, -2, -3, -3, -3, -1, 0,  0,  -3, 0,  6,  -4, -2, -2, 1,  3,  -1], // F
	'P': [-1, -2, -2, -1, -3, -1, -1, -2, -2, -3, -3, -1, -2, -4, 7,  -1, -1, -4, -3, -2], // P
	'S': [1,  -1, 1,  0,  -1, 0,  0,  0,  -1, -2, -2, 0,  -1, -2, -1, 4,  1,  -3, -2, -2], // S
	'T': [0,  -1, 0,  -1, -1, -1, -1, -2, -2, -1, -1, -1, -1, -2, -1, 1,  5,  -2, -2, 0],  // T
	'W': [-3, -3, -4, -4, -2, -2, -3, -2, -2, -3, -2, -3, -1, 1,  -4, -3, -2, 11, 2,  -3], // W
	'Y': [-2, -2, -2, -3, -2, -1, -2, -3, 2,  -1, -1, -2, -1, 3,  -3, -2, -2, 2,  7,  -1], // Y
	'V': [0,  -3, -3, -3, -1, -2, -2, -3, -3, 3,  1,  -2, 1,  -1, -2, -2, 0,  -3, -1, 4]   // V
}

const group = {
    'alphaticr': 'GAVLMI',
    'aromatic': 'FYW',
    'postivecharger': 'KRH',
    'negativecharger': 'DE',
    'uncharger': 'STCPNQ'
};
const groupKey = Object.keys(group);


const myCodons = {
	'A': 4,
	'C': 2,
	'D': 2,
	'E': 2,
	'F': 2,
	'G': 4,
	'H': 2,
	'I': 3,
	'K': 2,
	'L': 6,
	'M': 1,
	'N': 2,
	'P': 4,
	'Q': 2,
	'R': 6,
	'S': 6,
	'T': 4,
	'V': 4,
	'W': 1,
	'Y': 2
}
  
const myTM = [];
for (let pair of Object.keys(DPCDict)) {
    myTM.push((myCodons[pair[0]] / 61) * (myCodons[pair[1]] / 61));
}

export const PCP = (fragment) => {
    let pcp = [];
     for(let i = 0; i < fragment.length; i++){
         for(let j = 0; j < 16; j++){
             pcp.push(pcpList[fragment[i]][j]);
         }
     }
    //for(let i = 0; i < fragment.length; i++) {
    //    for(let j = 0; j < 16; j++) {
    //        pcp.push(pcpList[fragment[fragment.length - 1]][j]);
    //   }
    //}
    return pcp;
}

export const extractPSSM = (PSSM, fragments, windowSize) => {
    for(let i = 0; i < fragments.length; i++) {
        let temp = [];
        // console.log(PSSM);
        let pssmRow = PSSM.split('\n').slice(3);

        const start = (fragments[i].position) - (windowSize - 1) / 2 - 1;
        const end = (fragments[i].position) + (windowSize - 1) / 2 - 1;

	//const start = (fragments[i].position) - (windowSize - 1) / 2;
        //const end = (fragments[i].position) + (windowSize - 1) / 2


        for(let j = start; j <= end; j++) {
            // console.log(pssmRow[j]);
            if(typeof pssmRow[j] == 'undefined')
                continue;
            const row = pssmRow[j].split(/\s+/).slice(3, 23);
            let intRow = row.map(function (x) { 
                return parseInt(x, 10); 
            }); 
            temp.push(intRow);
        }

        fragments[i].PSSM = temp;


        // for(let j = 0; j < positions[i].length; j++) {
        //     const start = (positions[i][j]) - (windowSize - 1) / 2;
        //     const end = (positions[i][j]) + (windowSize - 1) / 2
        //     for(let k = start; k <= end; k++) {
        //         const row = pssmRow[k].split(/\s+/).slice(3, 23);
        //         // convert string to integer
        //         let intRow = row.map(function (x) { 
        //             return parseInt(x, 10); 
        //         }); 
        //         temp.push(intRow);
        //     }
        // }
    }
}

export const extractFeatureMatrix = (data, windowSize) => {
    let featureMatrix = [];
    for(let i = 0; i < data.length - 1; i++) {
        let fragments = data[i].fragments;
        // let tfcrf = TFCRF(fragments);
        for(let j = 0; j < fragments.length; j++) {
            let FM = [];
            let PSSM = fragments[j].PSSM;
            // let PCP = fragments[j].PCP;
            let EAAC = fragments[j].EAAC;
            let EGAAC = fragments[j].EGAAC;
            // let DPC = fragments[j].DPC;
            // let KSPACE = fragments[j].KSPACE;
            // let DDE = fragments[j].DDE;
            let BLOSUM = fragments[j].BLOSUM;
            // for(let k = 0; k < PSSM.length; k++) {
            //     FM = FM.concat(PSSM[k]);
            // }
            // FM = FM.concat(PCP).concat(AAC).concat(DPC).concat(KSPACE);
            FM = FM.concat(EAAC).concat(EGAAC).concat(BLOSUM);
            for(let k = 0; k < PSSM.length; k++) {
                FM = FM.concat(PSSM[k]);
            }
            featureMatrix.push(FM);
        }
    }
    console.log(featureMatrix);
    return featureMatrix;
}


const EAAC = (fragment, window = 5) => {
    let code = [];
    for (let j = 0; j < fragment.length; j++) {
        if (j < fragment.length && j + window <= fragment.length) {
            let count = {};
            let substring = fragment.substring(j, j + window).replace(/-/g, '');
            for (let i = 0; i < substring.length; i++) {
                let key = substring[i];
                count[key] = (count[key] || 0) + 1;
            }
            for (let aa of AA) {
                if (count[aa] == undefined) {
                    code.push(0);
                }
                else {
                    code.push(count[aa] / substring.length);
                }
            }
      }
    }
    return code;
  }

  const EGAAC = (fragment, window = 5) => {
    let code = [];
    for (let j = 0; j < fragment.length; j++) {
        if (j + window <= fragment.length) {
            let count = {};
            for (let k = j; k < j + window; k++) {
                count[fragment[k]] = (count[fragment[k]] || 0) + 1;
            }
            let myDict = {};
            for (let key of groupKey) {
                for (let aa of group[key]) {
                    myDict[key] = (myDict[key] || 0) + (count[aa] || 0);
                }
            }
            for (let key of groupKey) {
                code.push(myDict[key] / window);
            }
        }
    }
    return code;
}

const DDE = (fragment) => {
    let code = [];
    let tmpCode = new Array(400).fill(0);
    for (let j = 0; j < fragment.length - 2 + 1; j++) {
      let index = AADict[fragment[j]] * 20 + AADict[fragment[j+1]];
      tmpCode[index] = tmpCode[index] + 1;
    }
    if (tmpCode.reduce((a, b) => a + b, 0) !== 0) {
      tmpCode = tmpCode.map(i => i / tmpCode.reduce((a, b) => a + b, 0));
    }
  
    let myTV = [];
    for (let j = 0; j < myTM.length; j++) {
      myTV.push(myTM[j] * (1 - myTM[j]) / (fragment.length - 1));
    }
  
    for (let j = 0; j < tmpCode.length; j++) {
      tmpCode[j] = (tmpCode[j] - myTM[j]) / Math.sqrt(myTV[j]);
    }
    code = code.concat(tmpCode);
    return code;
}  
  


const KSPACE = (fragment) => {
    const subseqLen = fragment.length;
    let kspace = new Array(6 * 400).fill(0);
    for(let k = 0; k <= 5; k++) {
        for(let j = 0; j < 400; j++) {
            let re = new RegExp(DP[j][0]+'.{'+k+'}'+DP[j][1], 'g');
            let count = (fragment.match(re) || []).length;
            kspace[k * 400 + j] = count / (subseqLen - k - 1);
        }
        // kspace.push(temp);
    }
    return kspace;
}

const BLOSUM62 = (fragment) => {
    let blosum = [];
    for(let i = 0; i < fragment.length; i++) {
        for(let j = 0; j < 20; j++){
            blosum.push(blosum62_Dict[fragment[i]][j]);
        }
    }
    return blosum
}