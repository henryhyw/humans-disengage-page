window.DATA = {
  "meta": {
    "title": "Humans Disengage, Reasoning Models Persist",
    "subtitle": "An Item-Controlled Dissociation in Deliberation Allocation",
    "author": "Han-yu Wang",
    "affil": "The University of Hong Kong",
    "venue": "Submitted to Computational Brain & Behavior (Springer)",
    "osfUrl": "https://osf.io/jxb4a/?view_only=b20c133f0c9b404c8baa7474fc8d712f",
    "orcid": "https://orcid.org/0009-0003-0252-8423"
  },
  "headline": {
    "beta_LRM": -0.6550578573358538,
    "beta_LRM_ci": [
      -0.8076253019726731,
      -0.5024904126990344
    ],
    "beta_LRM_p": 3.921319873935091e-17,
    "human_within_item": 0.24147682174394855,
    "lrm_within_item": -0.27098579027054953,
    "d_range_well_powered": [
      1.47,
      3.13
    ],
    "mediation_pct": 48
  },
  "crossParadigm": [
    {
      "paradigm": "H-ARC",
      "domain": "Visual abstraction",
      "agent_type": "LRM",
      "agent": "DeepSeek-R1",
      "short": "R1",
      "d": 1.8055464919953477,
      "n_wrong": 237,
      "n_right": 61,
      "underpowered": false
    },
    {
      "paradigm": "H-ARC",
      "domain": "Visual abstraction",
      "agent_type": "LRM",
      "agent": "Qwen-QwQ-32B",
      "short": "QwQ",
      "d": 3.13322266134624,
      "n_wrong": 380,
      "n_right": 20,
      "underpowered": false
    },
    {
      "paradigm": "H-ARC",
      "domain": "Visual abstraction",
      "agent_type": "LRM",
      "agent": "GLM-4.5-Air-FP8",
      "short": "GLM-4.5",
      "d": 2.274120870168872,
      "n_wrong": 356,
      "n_right": 32,
      "underpowered": false
    },
    {
      "paradigm": "H-ARC",
      "domain": "Visual abstraction",
      "agent_type": "LRM",
      "agent": "gpt-oss-20b",
      "short": "oss-20b",
      "d": 0.9533779043139948,
      "n_wrong": 91,
      "n_right": 28,
      "underpowered": true
    },
    {
      "paradigm": "H-ARC",
      "domain": "Visual abstraction",
      "agent_type": "LRM",
      "agent": "gpt-oss-120b",
      "short": "oss-120b",
      "d": 1.47309179236029,
      "n_wrong": 322,
      "n_right": 67,
      "underpowered": false
    },
    {
      "paradigm": "H-ARC",
      "domain": "Visual abstraction",
      "agent_type": "human",
      "agent": "human",
      "short": "human",
      "d": -0.098824998895812,
      "n_wrong": 2113,
      "n_right": 1978,
      "underpowered": false
    },
    {
      "paradigm": "INTUIT",
      "domain": "Intuitive physics",
      "agent_type": "LRM",
      "agent": "DeepSeek-R1",
      "short": "R1",
      "d": 0.6887947487146994,
      "n_wrong": 16,
      "n_right": 128,
      "underpowered": false
    },
    {
      "paradigm": "INTUIT",
      "domain": "Intuitive physics",
      "agent_type": "LRM",
      "agent": "Qwen-QwQ-32B",
      "short": "QwQ",
      "d": 1.4233182899943932,
      "n_wrong": 28,
      "n_right": 116,
      "underpowered": false
    },
    {
      "paradigm": "INTUIT",
      "domain": "Intuitive physics",
      "agent_type": "LRM",
      "agent": "Qwen3-235B-Thinking",
      "short": "Qwen3-T",
      "d": 1.008790239960674,
      "n_wrong": 17,
      "n_right": 127,
      "underpowered": true
    },
    {
      "paradigm": "INTUIT",
      "domain": "Intuitive physics",
      "agent_type": "LRM",
      "agent": "GLM-4.5-Air-FP8",
      "short": "GLM-4.5",
      "d": 0.8465928684529602,
      "n_wrong": 25,
      "n_right": 119,
      "underpowered": false
    },
    {
      "paradigm": "INTUIT",
      "domain": "Intuitive physics",
      "agent_type": "LRM",
      "agent": "gpt-oss-20b",
      "short": "oss-20b",
      "d": 0.9269719024525168,
      "n_wrong": 35,
      "n_right": 109,
      "underpowered": true
    },
    {
      "paradigm": "INTUIT",
      "domain": "Intuitive physics",
      "agent_type": "LRM",
      "agent": "gpt-oss-120b",
      "short": "oss-120b",
      "d": 0.5913073478465561,
      "n_wrong": 33,
      "n_right": 111,
      "underpowered": false
    },
    {
      "paradigm": "INTUIT",
      "domain": "Intuitive physics",
      "agent_type": "human",
      "agent": "human",
      "short": "human",
      "d": 0.0683277842913953,
      "n_wrong": 294,
      "n_right": 1242,
      "underpowered": false
    },
    {
      "paradigm": "Cortes",
      "domain": "Relational reasoning",
      "agent_type": "LRM",
      "agent": "DeepSeek-R1",
      "short": "R1",
      "d": 1.2556875636371183,
      "n_wrong": 5,
      "n_right": 53,
      "underpowered": false
    },
    {
      "paradigm": "Cortes",
      "domain": "Relational reasoning",
      "agent_type": "LRM",
      "agent": "Qwen-QwQ-32B",
      "short": "QwQ",
      "d": 1.960920750978019,
      "n_wrong": 5,
      "n_right": 53,
      "underpowered": false
    },
    {
      "paradigm": "Cortes",
      "domain": "Relational reasoning",
      "agent_type": "LRM",
      "agent": "Qwen3-235B-Thinking",
      "short": "Qwen3-T",
      "d": 1.8457608923646236,
      "n_wrong": 5,
      "n_right": 53,
      "underpowered": true
    },
    {
      "paradigm": "Cortes",
      "domain": "Relational reasoning",
      "agent_type": "LRM",
      "agent": "GLM-4.5-Air-FP8",
      "short": "GLM-4.5",
      "d": 1.7985365830105633,
      "n_wrong": 5,
      "n_right": 53,
      "underpowered": false
    },
    {
      "paradigm": "Cortes",
      "domain": "Relational reasoning",
      "agent_type": "LRM",
      "agent": "gpt-oss-20b",
      "short": "oss-20b",
      "d": 0.8170952667170629,
      "n_wrong": 8,
      "n_right": 50,
      "underpowered": true
    },
    {
      "paradigm": "Cortes",
      "domain": "Relational reasoning",
      "agent_type": "LRM",
      "agent": "gpt-oss-120b",
      "short": "oss-120b",
      "d": 1.4975797831889563,
      "n_wrong": 5,
      "n_right": 53,
      "underpowered": false
    },
    {
      "paradigm": "Cortes",
      "domain": "Relational reasoning",
      "agent_type": "human",
      "agent": "human",
      "short": "human",
      "d": -0.3103325892693426,
      "n_wrong": 5514,
      "n_right": 14538,
      "underpowered": false
    }
  ],
  "registration": [
    {
      "agent": "DeepSeek-V3",
      "short": "V3",
      "rho": -0.0530705764078276,
      "rho_p": 0.2896744043526734,
      "n_items": 400
    },
    {
      "agent": "DeepSeek-R1",
      "short": "R1",
      "rho": 0.2939669721201235,
      "rho_p": 2.3665901728381717e-07,
      "n_items": 298
    },
    {
      "agent": "Qwen-QwQ-32B",
      "short": "QwQ",
      "rho": 0.16495061567225416,
      "rho_p": 0.0009283076924271866,
      "n_items": 400
    },
    {
      "agent": "Qwen3-235B-Thinking",
      "short": "Qwen3-T",
      "rho": 0.05662941709453338,
      "rho_p": 0.7183303253264159,
      "n_items": 43
    },
    {
      "agent": "GLM-4.5-Air-FP8",
      "short": "GLM-4.5",
      "rho": 0.27377040423785803,
      "rho_p": 4.245998563306545e-08,
      "n_items": 388
    },
    {
      "agent": "gpt-oss-20b",
      "short": "oss-20b",
      "rho": 0.2955518218606054,
      "rho_p": 1.6629104942541627e-09,
      "n_items": 400
    },
    {
      "agent": "gpt-oss-120b",
      "short": "oss-120b",
      "rho": 0.1868836272364537,
      "rho_p": 0.00017049454598902137,
      "n_items": 400
    }
  ],
  "phasePlot": [
    {
      "agent": "DeepSeek-V3",
      "short": "V3",
      "rho": -0.0530705764078276,
      "d": 0.52,
      "kind": "non-thinking",
      "underpowered": false
    },
    {
      "agent": "DeepSeek-R1",
      "short": "R1",
      "rho": 0.2939669721201235,
      "d": 1.8055464919953477,
      "kind": "thinking",
      "underpowered": false
    },
    {
      "agent": "Qwen-QwQ-32B",
      "short": "QwQ",
      "rho": 0.16495061567225416,
      "d": 3.13322266134624,
      "kind": "thinking",
      "underpowered": false
    },
    {
      "agent": "GLM-4.5-Air-FP8",
      "short": "GLM-4.5",
      "rho": 0.27377040423785803,
      "d": 2.274120870168872,
      "kind": "thinking",
      "underpowered": false
    },
    {
      "agent": "gpt-oss-20b",
      "short": "oss-20b",
      "rho": 0.2955518218606054,
      "d": 0.9533779043139948,
      "kind": "underpowered",
      "underpowered": true
    },
    {
      "agent": "gpt-oss-120b",
      "short": "oss-120b",
      "rho": 0.1868836272364537,
      "d": 1.47309179236029,
      "kind": "thinking",
      "underpowered": false
    },
    {
      "agent": "human",
      "short": "human",
      "rho": null,
      "d": -0.098824998895812,
      "kind": "human",
      "underpowered": false
    }
  ],
  "cortesCI": [
    {
      "agent": "DeepSeek-V3",
      "short": "V3",
      "agent_type": "non-thinking-LRM",
      "d": 1.411312472592161,
      "ci_low": 1.0567288813353113,
      "ci_high": 1.8407028016237668,
      "n_wrong": 5
    },
    {
      "agent": "DeepSeek-R1",
      "short": "R1",
      "agent_type": "LRM",
      "d": 1.2556875636371185,
      "ci_low": 0.9056022639113313,
      "ci_high": 1.746550884643401,
      "n_wrong": 5
    },
    {
      "agent": "Qwen-QwQ-32B",
      "short": "QwQ",
      "agent_type": "LRM",
      "d": 1.960920750978019,
      "ci_low": 1.321309228629127,
      "ci_high": 2.9179506184618336,
      "n_wrong": 5
    },
    {
      "agent": "Qwen3-235B-Thinking",
      "short": "Qwen3-T",
      "agent_type": "LRM",
      "d": 1.8457608923646234,
      "ci_low": 1.2267211356084085,
      "ci_high": 2.7518180456367998,
      "n_wrong": 5
    },
    {
      "agent": "GLM-4.5-Air-FP8",
      "short": "GLM-4.5",
      "agent_type": "LRM",
      "d": 1.7985365830105633,
      "ci_low": 1.3371624939135967,
      "ci_high": 2.4739604301949965,
      "n_wrong": 5
    },
    {
      "agent": "gpt-oss-20b",
      "short": "oss-20b",
      "agent_type": "LRM",
      "d": 0.8170952667170629,
      "ci_low": 0.11327465173064592,
      "ci_high": 1.5615283904211217,
      "n_wrong": 8
    },
    {
      "agent": "gpt-oss-120b",
      "short": "oss-120b",
      "agent_type": "LRM",
      "d": 1.4975797831889563,
      "ci_low": 0.9810224105443724,
      "ci_high": 2.154208431244039,
      "n_wrong": 5
    }
  ],
  "feSummary": {
    "human_within_item_correctness_slope": 0.24147682174394855,
    "human_within_item_p": 6.432785567560241e-18,
    "lrm_pooled_within_item_correctness_slope": -0.27098579027054953,
    "lrm_pooled_within_item_p": 2.2756449519656457e-05,
    "dissociation_interaction_beta": -0.6550578573358538,
    "dissociation_interaction_p": 3.921319873935091e-17,
    "dissociation_ci_lo": -0.8076253019726731,
    "dissociation_ci_hi": -0.5024904126990344,
    "implied_lrm_within_item_slope": -0.454064570700383
  },
  "mediation": {
    "no_actions": {
      "beta": 0.24147682174394855,
      "se": 0.027998673519273966,
      "p": 6.432785567560241e-18,
      "ci_lo": 0.18660043003127624,
      "ci_hi": 0.29635321345662086,
      "beta_log_actions": null
    },
    "with_actions": {
      "beta": 0.12547876489518725,
      "se": 0.023143657961154487,
      "p": 5.902355860782201e-08,
      "ci_lo": 0.08011802882081076,
      "ci_hi": 0.17083950096956374,
      "beta_log_actions": 0.611553873877392
    }
  },
  "traceContent": [
    {
      "paradigm": "H-ARC",
      "feature": "hedge_density_per1k_chars",
      "label": "self-doubt density",
      "beta": -0.43499597202741574,
      "ci_lo": -0.6868209225879507,
      "ci_hi": -0.18317102146688075,
      "p": 0.000710249992971297
    },
    {
      "paradigm": "H-ARC",
      "feature": "repetition_rate",
      "label": "5-gram repetition",
      "beta": 0.01564084677302045,
      "ci_lo": -0.002423346998428954,
      "ci_hi": 0.03370504054446985,
      "p": 0.08969080464145202
    },
    {
      "paradigm": "H-ARC",
      "feature": "type_token_ratio",
      "label": "type\u2013token ratio",
      "beta": -0.004089161527479602,
      "ci_lo": -0.0070234087924500995,
      "ci_hi": -0.0011549142625091038,
      "p": 0.00630654630563197
    },
    {
      "paradigm": "Cortes",
      "feature": "hedge_density_per1k_chars",
      "label": "self-doubt density",
      "beta": -0.817110164944332,
      "ci_lo": -2.4517656104927266,
      "ci_hi": 0.8175452806040626,
      "p": 0.32722378863534274
    },
    {
      "paradigm": "Cortes",
      "feature": "repetition_rate",
      "label": "5-gram repetition",
      "beta": -0.07384116476074681,
      "ci_lo": -0.10073756235567727,
      "ci_hi": -0.04694476716581636,
      "p": 7.41266427202e-08
    },
    {
      "paradigm": "Cortes",
      "feature": "type_token_ratio",
      "label": "type\u2013token ratio",
      "beta": 0.0406720802068472,
      "ci_lo": 0.016456939841234718,
      "ci_hi": 0.06488722057245969,
      "p": 0.0009948388870643645
    }
  ],
  "perLRM": [
    {
      "paradigm": "H-ARC",
      "agent": "DeepSeek-R1",
      "short": "R1",
      "beta": -0.5696156642186048,
      "p": 7.53210589628632e-12,
      "n_wrong": 237,
      "underpowered": false
    },
    {
      "paradigm": "H-ARC",
      "agent": "GLM-4.5-Air-FP8",
      "short": "GLM-4.5",
      "beta": -0.7306730404532099,
      "p": 8.571138382212643e-08,
      "n_wrong": 356,
      "underpowered": false
    },
    {
      "paradigm": "H-ARC",
      "agent": "Qwen-QwQ-32B",
      "short": "QwQ",
      "beta": -0.8311514534641171,
      "p": 2.876541265589697e-05,
      "n_wrong": 380,
      "underpowered": false
    },
    {
      "paradigm": "H-ARC",
      "agent": "Qwen3-235B-Thinking",
      "short": "Qwen3-T",
      "beta": -0.2702973532965198,
      "p": 0.05284232214355279,
      "n_wrong": 4,
      "underpowered": true
    },
    {
      "paradigm": "H-ARC",
      "agent": "gpt-oss-120b",
      "short": "oss-120b",
      "beta": -0.8017036151552748,
      "p": 6.855017603153814e-11,
      "n_wrong": 322,
      "underpowered": false
    },
    {
      "paradigm": "H-ARC",
      "agent": "gpt-oss-20b",
      "short": "oss-20b",
      "beta": -0.7768953416906492,
      "p": 0.0004638985991978382,
      "n_wrong": 91,
      "underpowered": true
    },
    {
      "paradigm": "INTUIT",
      "agent": "DeepSeek-R1",
      "short": "R1",
      "beta": -0.1380512540943334,
      "p": 0.26721647013591343,
      "n_wrong": 16,
      "underpowered": false
    },
    {
      "paradigm": "INTUIT",
      "agent": "GLM-4.5-Air-FP8",
      "short": "GLM-4.5",
      "beta": -0.28696197997632655,
      "p": 0.008878077573347196,
      "n_wrong": 25,
      "underpowered": false
    },
    {
      "paradigm": "INTUIT",
      "agent": "Qwen-QwQ-32B",
      "short": "QwQ",
      "beta": -0.7341928922118313,
      "p": 9.48645347561553e-06,
      "n_wrong": 28,
      "underpowered": false
    },
    {
      "paradigm": "INTUIT",
      "agent": "Qwen3-235B-Thinking",
      "short": "Qwen3-T",
      "beta": -0.17708981632989018,
      "p": 0.10505240286795367,
      "n_wrong": 17,
      "underpowered": true
    },
    {
      "paradigm": "INTUIT",
      "agent": "gpt-oss-120b",
      "short": "oss-120b",
      "beta": -0.26640925138646165,
      "p": 0.04505163238159669,
      "n_wrong": 33,
      "underpowered": false
    },
    {
      "paradigm": "INTUIT",
      "agent": "gpt-oss-20b",
      "short": "oss-20b",
      "beta": -0.6858580138632825,
      "p": 0.0032681843498231136,
      "n_wrong": 35,
      "underpowered": true
    },
    {
      "paradigm": "Cortes",
      "agent": "DeepSeek-R1",
      "short": "R1",
      "beta": -0.7321838234906449,
      "p": 1.5026957399679053e-16,
      "n_wrong": 5,
      "underpowered": false
    },
    {
      "paradigm": "Cortes",
      "agent": "GLM-4.5-Air-FP8",
      "short": "GLM-4.5",
      "beta": -0.9370562094299516,
      "p": 1.967040920151128e-26,
      "n_wrong": 5,
      "underpowered": false
    },
    {
      "paradigm": "Cortes",
      "agent": "Qwen-QwQ-32B",
      "short": "QwQ",
      "beta": -1.5055993427794858,
      "p": 3.993694095431886e-12,
      "n_wrong": 5,
      "underpowered": false
    },
    {
      "paradigm": "Cortes",
      "agent": "Qwen3-235B-Thinking",
      "short": "Qwen3-T",
      "beta": -0.766352944756133,
      "p": 8.620364881852045e-22,
      "n_wrong": 5,
      "underpowered": true
    },
    {
      "paradigm": "Cortes",
      "agent": "gpt-oss-120b",
      "short": "oss-120b",
      "beta": -1.195127288581103,
      "p": 4.477689612962884e-09,
      "n_wrong": 5,
      "underpowered": false
    },
    {
      "paradigm": "Cortes",
      "agent": "gpt-oss-20b",
      "short": "oss-20b",
      "beta": -0.7749144307312673,
      "p": 0.0002772075944898761,
      "n_wrong": 8,
      "underpowered": true
    }
  ],
  "rtOps": [
    {
      "label": "RT_attempt_1 (trial-level primary)",
      "d": -0.098824998895812,
      "n_right": 1978,
      "n_wrong": 2113
    },
    {
      "label": "Item-level RT_attempt_1, items by population-Accuracy median",
      "d": 0.6011631363324745,
      "n_right": 235,
      "n_wrong": 165
    }
  ],
  "strata": {
    "DeepSeek-R1": {
      "Q1_easy": {
        "d": 1.8793595844447795,
        "n_right": 20,
        "n_wrong": 50
      },
      "Q2": {
        "d": 1.9646442792305547,
        "n_right": 13,
        "n_wrong": 67
      },
      "Q3": {
        "d": 1.5297724886318298,
        "n_right": 17,
        "n_wrong": 57
      },
      "Q4_hard": {
        "d": 1.7105153391312402,
        "n_right": 11,
        "n_wrong": 63
      }
    },
    "Qwen-QwQ-32B": {
      "Q1_easy": {
        "d": 2.7746851178869436,
        "n_right": 9,
        "n_wrong": 92
      },
      "Q2": {
        "d": null,
        "n_right": 3,
        "n_wrong": 97
      },
      "Q3": {
        "d": 3.0182014222279476,
        "n_right": 6,
        "n_wrong": 93
      },
      "Q4_hard": {
        "d": null,
        "n_right": 2,
        "n_wrong": 98
      }
    },
    "Qwen3-235B-Thinking": {
      "Q1_easy": {
        "d": null,
        "n_right": 11,
        "n_wrong": 0
      },
      "Q2": {
        "d": null,
        "n_right": 8,
        "n_wrong": 3
      },
      "Q3": {
        "d": null,
        "n_right": 12,
        "n_wrong": 1
      },
      "Q4_hard": {
        "d": null,
        "n_right": 8,
        "n_wrong": 0
      }
    },
    "GLM-4.5-Air-FP8": {
      "Q1_easy": {
        "d": 2.2826695583661105,
        "n_right": 14,
        "n_wrong": 85
      },
      "Q2": {
        "d": 3.7054245444130895,
        "n_right": 5,
        "n_wrong": 90
      },
      "Q3": {
        "d": 1.6365993016351092,
        "n_right": 8,
        "n_wrong": 90
      },
      "Q4_hard": {
        "d": 2.1116504698341547,
        "n_right": 5,
        "n_wrong": 91
      }
    },
    "gpt-oss-20b": {
      "Q1_easy": {
        "d": 1.3356891204679164,
        "n_right": 12,
        "n_wrong": 28
      },
      "Q2": {
        "d": 0.2438861772866759,
        "n_right": 6,
        "n_wrong": 29
      },
      "Q3": {
        "d": 1.090540355213618,
        "n_right": 8,
        "n_wrong": 16
      },
      "Q4_hard": {
        "d": null,
        "n_right": 2,
        "n_wrong": 18
      }
    },
    "gpt-oss-120b": {
      "Q1_easy": {
        "d": 1.5893597901431782,
        "n_right": 22,
        "n_wrong": 79
      },
      "Q2": {
        "d": 1.5815559788145497,
        "n_right": 18,
        "n_wrong": 79
      },
      "Q3": {
        "d": 1.3199091077307428,
        "n_right": 15,
        "n_wrong": 79
      },
      "Q4_hard": {
        "d": 1.1857811541664303,
        "n_right": 12,
        "n_wrong": 85
      }
    }
  },
  "traceExamples": {
    "model": "Qwen-QwQ-32B",
    "paradigm": "H-ARC",
    "right": {
      "item": "00576224",
      "tokens": 797,
      "words": 388,
      "hedges": 2,
      "hedge_density": 0.39,
      "repetition_rate": 0.024,
      "ttr": 0.213,
      "verdict": "correct",
      "text": "Take the original two numbers, repeat each three times to form the first two elements. Then reverse each number's digits to get two new numbers, repeat each three times for the next two elements. Then repeat the original numbers again for the last two elements.\n\nSo applying this to the test input |32|78|:\n\nOriginal numbers are 32 and 78.\nFirst two elements: 32 repeated three times → 323232, and 78 repeated three times → 787878.\nThen reverse each: 32 becomes 23, 78 becomes 87. So third element is 232323, fourth is 878787.\nThen repeat the original numbers again: 323232 and 787878."
    },
    "wrong": {
      "item": "b0722778",
      "tokens": 12554,
      "words": 5781,
      "hedges": 79,
      "hedge_density": 10.6,
      "repetition_rate": 0.41,
      "ttr": 0.077,
      "verdict": "incorrect",
      "text": "Hmm.\n\nWait maybe the first two digits of the entire number divided by 10. For first element: 24 → 24/10=2.4 → 24? Not 58.\n\nHmm.\n\nWait maybe the 5th and 6th digits, concatenated. For first element: 8 and 0 → 80. Not 58.\n\nHmm.\n\nWait maybe the 3rd and 4th digits. For first element: 0 and 5 → 05. Not 58.\n\nHmm.\n\nWait maybe the 2nd and 3rd digits. For first element: 4 and 0 → 40. Not 58.\n\nHmm.\n\nWait maybe the 1st and 2nd digits. 24 → 24. Not 58.\n\nHmm.\n\nWait maybe..."
    }
  }
};
