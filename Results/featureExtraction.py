
import pandas as pd
import numpy as np
import re
import math
from collections import Counter
import fastaparser
import warnings
from joblib import dump
from sklearn.preprocessing import StandardScaler
from propy.PseudoAAC import GetAPseudoAAC

warnings.filterwarnings('ignore')

# requirements

AA = 'ACDEFGHIKLMNPQRSTVWY'
AADict = {}
DPCDict = {}

for i, aa in enumerate(AA):
    AADict[aa] = i
index = 0
for aa1 in AA:
    for aa2 in AA:
        DPCDict[aa1 + aa2] = index
        index += 1

blosum62_Dict = {
	'A': [4,  -1, -2, -2, 0,  -1, -1, 0, -2,  -1, -1, -1, -1, -2, -1, 1,  0,  -3, -2, 0],  # A
	'R': [-1, 5,  0,  -2, -3, 1,  0,  -2, 0,  -3, -2, 2,  -1, -3, -2, -1, -1, -3, -2, -3], # R
	'N': [-2, 0,  6,  1,  -3, 0,  0,  0,  1,  -3, -3, 0,  -2, -3, -2, 1,  0,  -4, -2, -3], # N
	'D': [-2, -2, 1,  6,  -3, 0,  2,  -1, -1, -3, -4, -1, -3, -3, -1, 0,  -1, -4, -3, -3], # D
	'C': [0,  -3, -3, -3, 9,  -3, -4, -3, -3, -1, -1, -3, -1, -2, -3, -1, -1, -2, -2, -1], # C
	'Q': [-1, 1,  0,  0,  -3, 5,  2,  -2, 0,  -3, -2, 1,  0,  -3, -1, 0,  -1, -2, -1, -2], # Q
	'E': [-1, 0,  0,  2,  -4, 2,  5,  -2, 0,  -3, -3, 1,  -2, -3, -1, 0,  -1, -3, -2, -2], # E
	'G': [0,  -2, 0,  -1, -3, -2, -2, 6,  -2, -4, -4, -2, -3, -3, -2, 0,  -2, -2, -3, -3], # G
	'H': [-2, 0,  1,  -1, -3, 0,  0,  -2, 8,  -3, -3, -1, -2, -1, -2, -1, -2, -2, 2,  -3], # H
	'I': [-1, -3, -3, -3, -1, -3, -3, -4, -3, 4,  2,  -3, 1,  0,  -3, -2, -1, -3, -1, 3],  # I
	'L': [-1, -2, -3, -4, -1, -2, -3, -4, -3, 2,  4,  -2, 2,  0,  -3, -2, -1, -2, -1, 1],  # L
	'K': [-1, 2,  0,  -1, -3, 1,  1,  -2, -1, -3, -2, 5,  -1, -3, -1, 0,  -1, -3, -2, -2], # K
	'M': [-1, -1, -2, -3, -1, 0,  -2, -3, -2, 1,  2,  -1, 5,  0,  -2, -1, -1, -1, -1, 1],  # M
	'F': [-2, -3, -3, -3, -2, -3, -3, -3, -1, 0,  0,  -3, 0,  6,  -4, -2, -2, 1,  3,  -1], # F
	'P': [-1, -2, -2, -1, -3, -1, -1, -2, -2, -3, -3, -1, -2, -4, 7,  -1, -1, -4, -3, -2], # P
	'S': [1,  -1, 1,  0,  -1, 0,  0,  0,  -1, -2, -2, 0,  -1, -2, -1, 4,  1,  -3, -2, -2], # S
	'T': [0,  -1, 0,  -1, -1, -1, -1, -2, -2, -1, -1, -1, -1, -2, -1, 1,  5,  -2, -2, 0],  # T
	'W': [-3, -3, -4, -4, -2, -2, -3, -2, -2, -3, -2, -3, -1, 1,  -4, -3, -2, 11, 2,  -3], # W
	'Y': [-2, -2, -2, -3, -2, -1, -2, -3, 2,  -1, -1, -2, -1, 3,  -3, -2, -2, 2,  7,  -1], # Y
	'V': [0,  -3, -3, -3, -1, -2, -2, -3, -3, 3,  1,  -2, 1,  -1, -2, -2, 0,  -3, -1, 4]   # V
}

blosum62 = [
	[ 4, -1, -2, -2,  0, -1, -1,  0, -2, -1, -1, -1, -1, -2, -1,  1,  0, -3, -2,  0, 0],  # A
	[-1,  5,  0, -2, -3,  1,  0, -2,  0, -3, -2,  2, -1, -3, -2, -1, -1, -3, -2, -3, 0],  # R
	[-2,  0,  6,  1, -3,  0,  0,  0,  1, -3, -3,  0, -2, -3, -2,  1,  0, -4, -2, -3, 0],  # N
	[-2, -2,  1,  6, -3,  0,  2, -1, -1, -3, -4, -1, -3, -3, -1,  0, -1, -4, -3, -3, 0],  # D
	[ 0, -3, -3, -3,  9, -3, -4, -3, -3, -1, -1, -3, -1, -2, -3, -1, -1, -2, -2, -1, 0],  # C
	[-1,  1,  0,  0, -3,  5,  2, -2,  0, -3, -2,  1,  0, -3, -1,  0, -1, -2, -1, -2, 0],  # Q
	[-1,  0,  0,  2, -4,  2,  5, -2,  0, -3, -3,  1, -2, -3, -1,  0, -1, -3, -2, -2, 0],  # E
	[ 0, -2,  0, -1, -3, -2, -2,  6, -2, -4, -4, -2, -3, -3, -2,  0, -2, -2, -3, -3, 0],  # G
	[-2,  0,  1, -1, -3,  0,  0, -2,  8, -3, -3, -1, -2, -1, -2, -1, -2, -2,  2, -3, 0],  # H
	[-1, -3, -3, -3, -1, -3, -3, -4, -3,  4,  2, -3,  1,  0, -3, -2, -1, -3, -1,  3, 0],  # I
	[-1, -2, -3, -4, -1, -2, -3, -4, -3,  2,  4, -2,  2,  0, -3, -2, -1, -2, -1,  1, 0],  # L
	[-1,  2,  0, -1, -3,  1,  1, -2, -1, -3, -2,  5, -1, -3, -1,  0, -1, -3, -2, -2, 0],  # K
	[-1, -1, -2, -3, -1,  0, -2, -3, -2,  1,  2, -1,  5,  0, -2, -1, -1, -1, -1,  1, 0],  # M
	[-2, -3, -3, -3, -2, -3, -3, -3, -1,  0,  0, -3,  0,  6, -4, -2, -2,  1,  3, -1, 0],  # F
	[-1, -2, -2, -1, -3, -1, -1, -2, -2, -3, -3, -1, -2, -4,  7, -1, -1, -4, -3, -2, 0],  # P
	[ 1, -1,  1,  0, -1,  0,  0,  0, -1, -2, -2,  0, -1, -2, -1,  4,  1, -3, -2, -2, 0],  # S
	[ 0, -1,  0, -1, -1, -1, -1, -2, -2, -1, -1, -1, -1, -2, -1,  1,  5, -2, -2,  0, 0],  # T
	[-3, -3, -4, -4, -2, -2, -3, -2, -2, -3, -2, -3, -1,  1, -4, -3, -2, 11,  2, -3, 0],  # W
	[-2, -2, -2, -3, -2, -1, -2, -3,  2, -1, -1, -2, -1,  3, -3, -2, -2,  2,  7, -1, 0],  # Y
	[ 0, -3, -3, -3, -1, -2, -2, -3, -3,  3,  1, -2,  1, -1, -2, -2,  0, -3, -1,  4, 0],  # V
	[ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0],  # -
]

myCodons = {
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

group = {
	'alphaticr': 'GAVLMI',
	'aromatic': 'FYW',
	'postivecharger': 'KRH',
	'negativecharger': 'DE',
	'uncharger': 'STCPNQ'
}
groupKey = group.keys()

myTM = []
for pair in list(DPCDict.keys()):
    myTM.append((myCodons[pair[0]] / 61) * (myCodons[pair[1]] / 61))



def loadPSSM(path):
    df = pd.read_csv(path, header=None, skiprows=3, skipfooter=5, delim_whitespace=True)
    return df.drop(0, axis=1).iloc[:, :21]

def loadPCP(path):
    return pd.read_excel(path)

def loadPOS_SITE(path):
    return pd.read_excel(path)

def loadFASTA(path):
    sequences = []
    with open(path) as fasta:
        parser = fastaparser.Reader(fasta)
        for seq in parser:
            sequences.append((seq.sequence_as_string(), seq.id.split('|')[1]))
    return sequences

def AAC(fragment, AADict):
    aac = np.zeros(20)
    for aa in fragment:
        aac[AADict[aa]] += 1
    return aac / len(fragment)

def EAAC(fragment, window=5):
    code = []
    for j in range(len(fragment)):
        if j < len(fragment) and j + window <= len(fragment):
            count = Counter(re.sub('-', '', fragment[j:j+window]))
            for key in count:
                count[key] = count[key] / len(re.sub('-', '', fragment[j:j+window]))
            for aa in AA:
                code.append(count[aa])
    return np.array(code)

def EGAAC(fragment, window=5):
    code = []
    for j in range(len(fragment)):
        if j + window <= len(fragment):
            count = Counter(fragment[j:j + window])
            myDict = {}
            for key in groupKey:
                for aa in group[key]:
                    myDict[key] = myDict.get(key, 0) + count[aa]
            for key in groupKey:
                code.append(myDict[key] / window)
    return np.array(code)

def DPC(fragment, DPCDict):
    dpc = np.zeros(400)
    for i in range(len(fragment) - 1):
        dpc[DPCDict[fragment[i:i + 2]]] += 1
    dpc /= (len(fragment) - 1)
    return dpc

def DDE(fragment):
    code = []
    tmpCode = [0] * 400
    for j in range(len(fragment) - 2 + 1):
        tmpCode[AADict[fragment[j]] * 20 + AADict[fragment[j+1]]] = tmpCode[AADict[fragment[j]] * 20 + AADict[fragment[j+1]]] +1
    if sum(tmpCode) != 0:
        tmpCode = [i/sum(tmpCode) for i in tmpCode]

    myTV = []
    for j in range(len(myTM)):
        myTV.append(myTM[j] * (1-myTM[j]) / (len(fragment) - 1))

    for j in range(len(tmpCode)):
        tmpCode[j] = (tmpCode[j] - myTM[j]) / math.sqrt(myTV[j])

    code = code + tmpCode
    return np.array(code)

def KSPACE(fragment, DPCDict):
    kspace = np.zeros(1600)
    index = 0
    subseqLen = len(fragment)
    for k in range(1, 5):
        for P in DPCDict.items():
            pattern = P[0][0] + '.{' + str(k) + '}' + P[0][1]
            kspace[index] = len(re.findall(pattern, fragment)) / (subseqLen - k - 1)
            index += 1
    return kspace

def PCP(fragment, PCP_DF):
    pcp = []
    # improve
    for P in fragment:
        pcp.append(PCP_DF.loc[PCP_DF['*'] == P].drop(['*'], axis = 1).values)
    return np.array(pcp).flatten()

def PSSM(fragment, PSSM_DF, K_Index):
    subseqLen = len(fragment)
    start_index = K_Index - (subseqLen - 1) // 2
    end_index = K_Index + (subseqLen - 1) // 2
    pssm = PSSM_DF.iloc[start_index:end_index + 1].drop(1, axis=1).values
    return pssm.flatten()

def BLOSUM62(fragment):
    blosum = []
    for P in fragment:
        blosum.extend(blosum62_Dict[P])
    return np.array(blosum)

# Start of KNNPeptide
def Sim(a, b):
    AA = 'ARNDCQEGHILKMFPSTWYV-'
    myDict = {}
    for i in range(len(AA)):
        myDict[AA[i]] = i
    maxValue, minValue = 11, -4
    return (blosum62[myDict[a]][myDict[b]] - minValue) / (maxValue - minValue)

def CalculateDistance(sequence1, sequence2):
	distance = 1 - sum([Sim(sequence1[i], sequence2[i]) for i in range(len(sequence1))]) / len(sequence1)
	return distance

def CalculateContent(myDistance, j, myLabelSets):
	content = []
	myDict = {}
	for i in myLabelSets:
		myDict[i] = 0
	for i in range(j):
		myDict[myDistance[i][0]] = myDict[myDistance[i][0]] + 1
	for i in myLabelSets:
		content.append(myDict[myLabelSets[i]] / j)
	return content

def KNNpeptide(fragment_train, fragment_test, y_train):
    myLabelSets = list(set(y_train))
    kNum = [2,4,8,16,32,64]
    encodings = []

    for i, sequence_test in enumerate(fragment_test):
        print(i)
        code = []
        myDistance = []
        for j, sequence_train in enumerate(fragment_train):
            if i != j:
                myDistance.append([y_train[j], CalculateDistance(sequence_train, sequence_test)])

        myDistance = np.array(myDistance)
        myDistance = myDistance[np.lexsort(myDistance.T)]

        for j in kNum:
            code = code + CalculateContent(myDistance, j, myLabelSets)
        encodings.append(code)

    return pd.DataFrame(encodings)
# End of KNNPeptide

def ExtractFragments(sequence, window_size):
    fragments = []
    size = (window_size - 1) // 2
    for i in range(len(sequence)):
        if sequence[i] == 'K':
            fragment = sequence[i - size: i + size + 1]
            if len(fragment) < window_size:
                continue
            fragments.append((fragment, i))
    return fragments

def ExtractFeatures(df, window_size=5, path='train'):

    indexes = np.unique(df['Uniprot Accession'], return_index=True)[1]
    seq_name = [df['Uniprot Accession'][index] for index in sorted(indexes)]

    # seq_name = np.unique(df['Uniprot Accession'])
    sequences = []
    positions = []

    for i in range(len(seq_name)):
        seq = df[df['Uniprot Accession'] == seq_name[i]]['Sequence'].values[0]
        position = df[df['Uniprot Accession'] == seq_name[i]]['Position'].values
        sequences.append(seq)
        positions.append(position)

    FeatureMatrix_POS = []
    FeatureMatrix_NEG = []

    for i, fasta in enumerate(sequences):
        print(f'{i}/{len(sequences)}')
        pos_index = positions[i] - 1
        fragments = ExtractFragments(fasta, window_size)
        # pssm_df = loadPSSM(f'dataset/pssm/{path}/{i + 1}.pssm')
        for fragment in fragments:
            # aac = AAC(fragment[0], AADict)
            # eaac = EAAC(fragment[0])
            # egaac = EGAAC(fragment[0])
            # dpc = DPC(fragment[0], DPCDict)
            # dde = DDE(fragment[0])
            # blo = BLOSUM62(fragment[0])
            # kspace = KSPACE(fragment[0], DPCDict)
            paac = list(GetAPseudoAAC(fragment[0]).values())
            # pssm = PSSM(fragment[0], pssm_df, fragment[1])
            if fragment[1] in pos_index:
                FeatureMatrix_POS.append(np.concatenate((paac, [1])))
            else:
                FeatureMatrix_NEG.append(np.concatenate((paac, [0])))
    
    FM = pd.DataFrame(FeatureMatrix_POS + FeatureMatrix_NEG)

    return FM



if __name__ == '__main__':
    df_train = pd.read_excel('dataset/Train.xlsx')
    df_test = pd.read_excel('dataset/Test.xlsx')

    WINDOW_SIZE = 35

    FM_train = ExtractFeatures(df_train, window_size=WINDOW_SIZE)
    FM_test = ExtractFeatures(df_test, window_size=WINDOW_SIZE, path='test')

    # print(KNNpeptide(FM_train[0].values, FM_train.iloc[:5][0].values, FM_train[2].values.astype('int')))

    from imblearn.under_sampling import RandomUnderSampler

    rus = RandomUnderSampler(random_state=0)
    # print(np.unique(FM_train.iloc[:, -1]))
    FM_train, _ = rus.fit_resample(FM_train, FM_train.iloc[:, -1])
    FM_test, _ = rus.fit_resample(FM_test, FM_test.iloc[:, -1])



    FM_train.to_csv(f'features/paac_train_{WINDOW_SIZE}.csv', index=False)
    X_train = FM_train.iloc[:, :-1]

    # Fit scaler on train dataset and save it
    # scaler = StandardScaler()
    # scaler.fit(X_train)
    # dump(scaler, f'scaler_{WINDOW_SIZE}.joblib')


    # del FM_train, X_train

    FM_test.to_csv(f'features/paac_test_{WINDOW_SIZE}.csv', index=False)
    # del FM_test
