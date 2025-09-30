/**
 * Test Data Fixtures for WooCommerce Order Preview System
 *
 * Comprehensive test data covering all scenarios:
 * - Valid designs
 * - Edge cases
 * - Error conditions
 * - Legacy formats
 * - Performance testing data
 *
 * Usage in Browser Console:
 *   const testData = WCOrderPreviewTestData;
 *   console.log(testData.valid.simpleDesign);
 *
 * Usage in Automated Tests:
 *   import { WCOrderPreviewTestData } from './test-data-fixtures.js';
 */

const WCOrderPreviewTestData = {

    /**
     * VALID TEST DATA
     * These should all render successfully
     */
    valid: {

        /**
         * Simple design with basic elements
         */
        simpleDesign: {
            view_0: {
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [
                    {
                        id: 'img_1',
                        src: 'https://via.placeholder.com/150x150/0073aa/ffffff?text=Logo',
                        x: 175,
                        y: 175,
                        width: 150,
                        height: 150,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 0,
                        opacity: 1
                    }
                ],
                text: [
                    {
                        id: 'text_1',
                        content: 'Sample Text',
                        x: 250,
                        y: 400,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    }
                ]
            }
        },

        /**
         * Complex design with multiple elements
         */
        complexDesign: {
            view_0: {
                canvas: {
                    width: 800,
                    height: 600
                },
                background: {
                    type: 'color',
                    color: '#f0f0f0'
                },
                images: [
                    {
                        id: 'img_1',
                        src: 'https://via.placeholder.com/200x200/ff6b6b/ffffff?text=Image+1',
                        x: 50,
                        y: 50,
                        width: 200,
                        height: 200,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 0,
                        opacity: 1
                    },
                    {
                        id: 'img_2',
                        src: 'https://via.placeholder.com/150x150/4ecdc4/ffffff?text=Image+2',
                        x: 300,
                        y: 100,
                        width: 150,
                        height: 150,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 15,
                        opacity: 0.9
                    },
                    {
                        id: 'img_3',
                        src: 'https://via.placeholder.com/180x180/ffe66d/333333?text=Image+3',
                        x: 550,
                        y: 150,
                        width: 180,
                        height: 180,
                        scaleX: 1,
                        scaleY: 1,
                        angle: -10,
                        opacity: 0.85
                    }
                ],
                text: [
                    {
                        id: 'text_1',
                        content: 'Main Title',
                        x: 400,
                        y: 50,
                        fontSize: 48,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fill: '#333333',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    },
                    {
                        id: 'text_2',
                        content: 'Subtitle Text',
                        x: 400,
                        y: 500,
                        fontSize: 24,
                        fontFamily: 'Georgia',
                        fontStyle: 'italic',
                        fill: '#666666',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    },
                    {
                        id: 'text_3',
                        content: 'Rotated Text',
                        x: 100,
                        y: 400,
                        fontSize: 18,
                        fontFamily: 'Courier New',
                        fill: '#0073aa',
                        angle: -45,
                        opacity: 0.8,
                        textAlign: 'left'
                    }
                ]
            }
        },

        /**
         * Multi-view design (front and back)
         */
        multiViewDesign: {
            view_0: {
                name: 'Front',
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [
                    {
                        id: 'front_img_1',
                        src: 'https://via.placeholder.com/200x200/0073aa/ffffff?text=Front+Logo',
                        x: 150,
                        y: 150,
                        width: 200,
                        height: 200,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 0,
                        opacity: 1
                    }
                ],
                text: [
                    {
                        id: 'front_text_1',
                        content: 'FRONT SIDE',
                        x: 250,
                        y: 400,
                        fontSize: 32,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fill: '#000000',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    }
                ]
            },
            view_1: {
                name: 'Back',
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#f5f5f5'
                },
                images: [
                    {
                        id: 'back_img_1',
                        src: 'https://via.placeholder.com/150x150/dc2626/ffffff?text=Back+Logo',
                        x: 175,
                        y: 175,
                        width: 150,
                        height: 150,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 0,
                        opacity: 1
                    }
                ],
                text: [
                    {
                        id: 'back_text_1',
                        content: 'BACK SIDE',
                        x: 250,
                        y: 400,
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fill: '#333333',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    }
                ]
            }
        },

        /**
         * Design with background image
         */
        backgroundImageDesign: {
            view_0: {
                canvas: {
                    width: 600,
                    height: 400
                },
                background: {
                    type: 'image',
                    src: 'https://via.placeholder.com/600x400/eeeeee/999999?text=Background+Image',
                    opacity: 0.3
                },
                images: [],
                text: [
                    {
                        id: 'text_1',
                        content: 'Text on Background',
                        x: 300,
                        y: 200,
                        fontSize: 36,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fill: '#000000',
                        stroke: '#ffffff',
                        strokeWidth: 2,
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    }
                ]
            }
        },

        /**
         * WooCommerce order response wrapper format
         */
        orderResponseWrapper: {
            order_id: 12345,
            design_data: {
                view_0: {
                    canvas: {
                        width: 500,
                        height: 500
                    },
                    background: {
                        type: 'color',
                        color: '#ffffff'
                    },
                    images: [
                        {
                            id: 'img_1',
                            src: 'https://via.placeholder.com/150x150',
                            x: 175,
                            y: 175,
                            width: 150,
                            height: 150,
                            scaleX: 1,
                            scaleY: 1,
                            angle: 0,
                            opacity: 1
                        }
                    ],
                    text: []
                }
            },
            mockup_url: 'https://example.com/mockup.jpg',
            canvas_dimensions: {
                width: 500,
                height: 500
            },
            has_design_data: true,
            has_mockup_url: true,
            has_canvas_dimensions: true,
            timestamp: '2025-09-30T12:00:00+00:00'
        }
    },

    /**
     * EDGE CASES
     * Unusual but valid scenarios
     */
    edgeCases: {

        /**
         * Empty design (no images or text)
         */
        emptyDesign: {
            view_0: {
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [],
                text: []
            }
        },

        /**
         * Only text, no images
         */
        textOnlyDesign: {
            view_0: {
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#fafafa'
                },
                images: [],
                text: [
                    {
                        id: 'text_1',
                        content: 'Text Only Design',
                        x: 250,
                        y: 250,
                        fontSize: 32,
                        fontFamily: 'Arial',
                        fill: '#333333',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    }
                ]
            }
        },

        /**
         * Only images, no text
         */
        imagesOnlyDesign: {
            view_0: {
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [
                    {
                        id: 'img_1',
                        src: 'https://via.placeholder.com/400x400',
                        x: 50,
                        y: 50,
                        width: 400,
                        height: 400,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 0,
                        opacity: 1
                    }
                ],
                text: []
            }
        },

        /**
         * Very large canvas
         */
        largeCanvasDesign: {
            view_0: {
                canvas: {
                    width: 2000,
                    height: 2000
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [
                    {
                        id: 'img_1',
                        src: 'https://via.placeholder.com/500x500',
                        x: 750,
                        y: 750,
                        width: 500,
                        height: 500,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 0,
                        opacity: 1
                    }
                ],
                text: [
                    {
                        id: 'text_1',
                        content: 'Large Canvas',
                        x: 1000,
                        y: 100,
                        fontSize: 72,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    }
                ]
            }
        },

        /**
         * Very small canvas
         */
        smallCanvasDesign: {
            view_0: {
                canvas: {
                    width: 100,
                    height: 100
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [
                    {
                        id: 'img_1',
                        src: 'https://via.placeholder.com/50x50',
                        x: 25,
                        y: 25,
                        width: 50,
                        height: 50,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 0,
                        opacity: 1
                    }
                ],
                text: []
            }
        },

        /**
         * Unicode text (emoji, special characters)
         */
        unicodeTextDesign: {
            view_0: {
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [],
                text: [
                    {
                        id: 'text_1',
                        content: 'Hello World! 👋🌍',
                        x: 250,
                        y: 150,
                        fontSize: 32,
                        fontFamily: 'Arial',
                        fill: '#333333',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    },
                    {
                        id: 'text_2',
                        content: 'Spëçiål Çhåracters',
                        x: 250,
                        y: 250,
                        fontSize: 28,
                        fontFamily: 'Georgia',
                        fill: '#666666',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    },
                    {
                        id: 'text_3',
                        content: '日本語 中文 한국어',
                        x: 250,
                        y: 350,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#999999',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    }
                ]
            }
        },

        /**
         * Extreme rotation angles
         */
        extremeRotationDesign: {
            view_0: {
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [
                    {
                        id: 'img_1',
                        src: 'https://via.placeholder.com/100x100',
                        x: 250,
                        y: 250,
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 180,
                        opacity: 1
                    }
                ],
                text: [
                    {
                        id: 'text_1',
                        content: 'Rotated 90°',
                        x: 100,
                        y: 250,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        angle: 90,
                        opacity: 1,
                        textAlign: 'center'
                    },
                    {
                        id: 'text_2',
                        content: 'Upside Down',
                        x: 400,
                        y: 250,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        angle: 180,
                        opacity: 1,
                        textAlign: 'center'
                    }
                ]
            }
        }
    },

    /**
     * ERROR CASES
     * Invalid data that should trigger errors
     */
    errors: {

        /**
         * Missing canvas dimensions
         */
        missingCanvas: {
            view_0: {
                // Missing canvas property
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [],
                text: []
            }
        },

        /**
         * Invalid canvas dimensions (zero)
         */
        zeroCanvasSize: {
            view_0: {
                canvas: {
                    width: 0,
                    height: 0
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [],
                text: []
            }
        },

        /**
         * Negative canvas dimensions
         */
        negativeCanvasSize: {
            view_0: {
                canvas: {
                    width: -500,
                    height: -500
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [],
                text: []
            }
        },

        /**
         * Missing required image properties
         */
        invalidImage: {
            view_0: {
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [
                    {
                        id: 'img_1',
                        // Missing src
                        x: 100,
                        y: 100,
                        width: 150,
                        height: 150
                    }
                ],
                text: []
            }
        },

        /**
         * Missing required text properties
         */
        invalidText: {
            view_0: {
                canvas: {
                    width: 500,
                    height: 500
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [],
                text: [
                    {
                        id: 'text_1',
                        // Missing content
                        x: 250,
                        y: 250,
                        fontSize: 24
                    }
                ]
            }
        },

        /**
         * Malformed JSON string
         */
        malformedJSON: '{"view_0": {"canvas": {"width": 500}',

        /**
         * Null data
         */
        nullData: null,

        /**
         * Undefined data
         */
        undefinedData: undefined,

        /**
         * Empty object
         */
        emptyObject: {},

        /**
         * Empty array
         */
        emptyArray: [],

        /**
         * Wrong data type (string)
         */
        stringData: 'This is not valid design data',

        /**
         * Wrong data type (number)
         */
        numberData: 12345
    },

    /**
     * LEGACY FORMATS
     * Old data structures for backward compatibility testing
     */
    legacy: {

        /**
         * Old format with different structure
         */
        oldFormat: {
            canvas_width: 500,
            canvas_height: 500,
            bg_color: '#ffffff',
            elements: [
                {
                    type: 'image',
                    url: 'https://via.placeholder.com/150',
                    posX: 175,
                    posY: 175,
                    width: 150,
                    height: 150
                },
                {
                    type: 'text',
                    text: 'Legacy Text',
                    posX: 250,
                    posY: 400,
                    size: 24,
                    color: '#000000'
                }
            ]
        }
    },

    /**
     * PERFORMANCE TESTING DATA
     * Large datasets for performance benchmarking
     */
    performance: {

        /**
         * Design with many images (stress test)
         */
        manyImages: {
            view_0: {
                canvas: {
                    width: 1000,
                    height: 1000
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: Array.from({ length: 50 }, (_, i) => ({
                    id: `img_${i}`,
                    src: `https://via.placeholder.com/50x50?text=${i}`,
                    x: (i % 10) * 100,
                    y: Math.floor(i / 10) * 100,
                    width: 50,
                    height: 50,
                    scaleX: 1,
                    scaleY: 1,
                    angle: 0,
                    opacity: 1
                })),
                text: []
            }
        },

        /**
         * Design with many text elements (stress test)
         */
        manyTextElements: {
            view_0: {
                canvas: {
                    width: 1000,
                    height: 1000
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [],
                text: Array.from({ length: 100 }, (_, i) => ({
                    id: `text_${i}`,
                    content: `Text ${i}`,
                    x: (i % 10) * 100 + 50,
                    y: Math.floor(i / 10) * 100 + 50,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#333333',
                    angle: 0,
                    opacity: 1,
                    textAlign: 'center'
                }))
            }
        },

        /**
         * Design with very long text
         */
        longTextDesign: {
            view_0: {
                canvas: {
                    width: 800,
                    height: 600
                },
                background: {
                    type: 'color',
                    color: '#ffffff'
                },
                images: [],
                text: [
                    {
                        id: 'text_1',
                        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20),
                        x: 400,
                        y: 300,
                        fontSize: 12,
                        fontFamily: 'Arial',
                        fill: '#333333',
                        angle: 0,
                        opacity: 1,
                        textAlign: 'center'
                    }
                ]
            }
        }
    }
};

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WCOrderPreviewTestData };
}

// Global exposure for browser console
if (typeof window !== 'undefined') {
    window.WCOrderPreviewTestData = WCOrderPreviewTestData;
    console.log('%c✅ Test Data Fixtures Loaded', 'color: #16a34a; font-weight: bold;');
    console.log('Access test data via: WCOrderPreviewTestData');
    console.log('Example: WCOrderPreviewTestData.valid.simpleDesign');
}
