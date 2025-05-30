
import React, { useState } from 'react';
import {
    StyleSheet,
    useWindowDimensions,
    Image,
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    useColorScheme,
} from 'react-native';
import RenderHTML, {
    defaultSystemFonts,
    TNode,
} from 'react-native-render-html';
import HTMLImage from './HTMLImage';

const placeholderImage = require('../assets/placeholder.png');

interface HTMLRendererProps {
    htmlContent: string;
}

const HTMLRenderer: React.FC<HTMLRendererProps> = ({ htmlContent }) => {
    const { width } = useWindowDimensions();
    const [isImageViewerVisible, setImageViewerVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const theme = useColorScheme();
    const isDarkMode = theme === 'dark';
    
    // Dark mode background color
    const darkBackgroundColor = '#121212';

    const customFonts = [
        'Times New Roman',
        'Calibri',
        Platform.OS === 'ios' ? 'System' : 'Noto Sans',
        'Arial Unicode MS'
    ];

    // Enhanced content processing with more aggressive background color removal
    const processedContent = htmlContent
        // More aggressively remove background-color
        .replace(/background-color:\s*[^;'"]+/gi, '')
        .replace(/style="[^"]*background-color:\s*[^;'"]+[^"]*"/gi, '')
        .replace(/background:\s*[^;'"]+/gi, '')  // Also remove background shorthand
        .replace(/style="[^"]*background:\s*[^;'"]+[^"]*"/gi, '')
        // Remove bgcolor attribute from tags
        .replace(/bgcolor="[^"]*"/gi, '')
        // Existing character replacements
        .replace(/<span style="font-family: Wingdings;">[^<]*ü[^<]*<\/span>/g, '✓')
        .replaceAll('ü', '✓')
        .replaceAll('Ø', '➡️')
        .replace(/&Oslash;/g, 'Ø')
        .replace(/&#252;/g, '✓')
        .replace(/&#216;/g, 'Ø')
        .replace(/&nbsp;/g, ' ')
        .replace(/<br><br>/g, '</p><p>')
        .replace(/class="MsoListParagraph[^"]*"/g, '')
        .replace(/style="[^"]*text-indent:[^"]*"/g, '')
        .replace(/style="[^"]*margin:[^"]*"/g, '')
        .replace(/<span style="font-family: Symbol;"><span>·[^<]*<\/span><\/span>/g, '•')
        .replace(/<span style="font: 9px[^>]*>[^<]*<\/span>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Updated ListItemRenderer for react-native-render-html v6.3.4
    const ListItemRenderer = ({ TDefaultRenderer, ...props }) => {
        // Check if we can safely access the content
        const textContent = props.tnode.children?.[0]?.data || '';
        const isCheckmark = textContent.includes('✓');
        
        return (
            <View style={[
                styles.listItemContainer,
                isDarkMode && { backgroundColor: darkBackgroundColor }
            ]}>
                {isCheckmark ? (
                    <Text style={[styles.checkmark, isDarkMode && styles.checkmarkDark]}>✓</Text>
                ) : (
                    <Text style={[styles.bullet, isDarkMode && styles.bulletDark]}>•</Text>
                )}
                <View style={[
                    styles.listItemContent,
                    isDarkMode && { backgroundColor: darkBackgroundColor }
                ]}>
                    <TDefaultRenderer {...props} />
                </View>
            </View>
        );
    };

    const handleImagePress = (imageUri: string) => {
        console.log("clicked-image", imageUri);
        setCurrentImage(imageUri);
        setImageViewerVisible(true);
    };

    const ImageRenderer = (props) => {
        const { tnode } = props;
        const [imageError, setImageError] = useState(false);
        const [loading, setLoading] = useState(true);
        const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
        
        const src = tnode.attributes.src || '';
        const encodedSrc = encodeURI(src);
        const source = { uri: encodedSrc };
        
        // Determine aspect ratio from HTML attributes or loaded image
        const aspectRatio = tnode.attributes.width && tnode.attributes.height
            ? parseInt(tnode.attributes.width) / parseInt(tnode.attributes.height)
            : imageSize.width && imageSize.height
                ? imageSize.width / imageSize.height
                : 1;
        
        return (
            <TouchableOpacity
                style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDarkMode ? darkBackgroundColor : 'transparent',
                }}
                onPress={() => handleImagePress(encodedSrc)}
            >
                {loading && (
                    <View style={{ 
                        position: 'absolute', 
                        zIndex: 1, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'transparent'
                    }}>
                        <ActivityIndicator 
                            size="large" 
                            color={isDarkMode ? '#66b3ff' : '#0066cc'} 
                        />
                    </View>
                )}
                <Image
                    source={imageError ? placeholderImage : source}
                    style={{
                        width: '100%',
                        aspectRatio: aspectRatio,
                        resizeMode: 'contain',
                    }}
                    onLoadEnd={() => setLoading(false)}
                    onError={(error) => {
                        console.error('Image Load Error:', error.nativeEvent);
                        setImageError(true);
                    }}
                    onLoad={(event) => {
                        const { width, height } = event.nativeEvent.source;
                        setImageSize({ width, height });
                    }}
                />
                {imageError && (
                    <Text style={{
                        color: isDarkMode ? '#666' : '#999',
                        fontSize: 14,
                        textAlign: 'center',
                        backgroundColor: isDarkMode ? darkBackgroundColor : 'transparent',
                    }}>
                        Image not available
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    // Theme-specific styles
    const themeStyles = isDarkMode ? {
        body: { 
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        p: { 
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        a: { 
            color: '#66b3ff', 
            backgroundColor: darkBackgroundColor
        },
        h1: { 
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        h2: { 
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        span: {
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        div: {
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        table: {
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        tr: {
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        td: {
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        th: {
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        ul: {
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        ol: {
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        },
        li: {
            color: '#FFFFFF',
            backgroundColor: darkBackgroundColor
        }
    } : {
        body: { color: '#333333', backgroundColor: 'transparent' },
        p: { color: '#333333', backgroundColor: 'transparent' },
        a: { color: '#0066cc', backgroundColor: 'transparent' },
        h1: { color: '#333333', backgroundColor: 'transparent' },
        h2: { color: '#333333', backgroundColor: 'transparent' },
        span: { color: '#333333', backgroundColor: 'transparent' },
        div: { color: '#333333', backgroundColor: 'transparent' },
        table: { color: '#333333', backgroundColor: 'transparent' },
        tr: { color: '#333333', backgroundColor: 'transparent' },
        td: { color: '#333333', backgroundColor: 'transparent' },
        th: { color: '#333333', backgroundColor: 'transparent' },
        ul: { color: '#333333', backgroundColor: 'transparent' },
        ol: { color: '#333333', backgroundColor: 'transparent' },
        li: { color: '#333333', backgroundColor: 'transparent' }
    };

    const renderers = {
        img: ImageRenderer,
        li: ListItemRenderer
    };

    // Function to modify elements during rendering
    const domVisitors = {
        onElement: (element) => {
            // Remove background attributes
            if (element.attribs) {
                delete element.attribs.bgcolor;
                // Strip background-related stuff from style
                if (element.attribs.style) {
                    element.attribs.style = element.attribs.style
                        .replace(/background-color:[^;]+;?/g, '')
                        .replace(/background:[^;]+;?/g, '');
                }
            }
            return element;
        }
    };

    const renderConfig = {
        renderers,
        systemFonts: [...defaultSystemFonts, ...customFonts],
        baseStyle: {
            color: isDarkMode ? '#FFFFFF' : '#333333',
            backgroundColor: isDarkMode ? darkBackgroundColor : 'transparent',
        },
        defaultTextProps: {
            style: {
                color: isDarkMode ? '#FFFFFF' : '#333333',
                backgroundColor: isDarkMode ? darkBackgroundColor : 'transparent',
            }
        },
        tagsStyles: {
            ...themeStyles,
            img: {
                margin: 0,
                padding: 0,
                backgroundColor: 'transparent',
            }
        },
        contentStyle: {
            margin: 0,
            padding: 0,
            backgroundColor: isDarkMode ? darkBackgroundColor : 'transparent',
        }
    };

    return (
        <View style={[
            styles.container, 
            isDarkMode && { backgroundColor: darkBackgroundColor }
        ]}>
            {/* Add another wrapping View to ensure background */}
            <View style={{ 
                backgroundColor: isDarkMode ? darkBackgroundColor : 'transparent',
                flex: 1
            }}>
                <RenderHTML
                    contentWidth={width}
                    source={{ html: processedContent }}
                    renderers={renderers}
                    domVisitors={domVisitors}
                    ignoredDomTags={['bgcolor']}
                    {...renderConfig}
                />
            </View>
            {currentImage && (
                <HTMLImage
                    isVisible={isImageViewerVisible}
                    imageUri={currentImage}
                    onClose={() => setImageViewerVisible(false)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 8,
        paddingLeft: 16,
        paddingRight: 16,
    },
    listItemContent: {
        flex: 1,
        marginLeft: 8,
    },
    bullet: {
        fontSize: 16,
        color: '#333333',
        marginTop: Platform.OS === 'ios' ? 2 : 0,
        width: 16,
    },
    bulletDark: {
        color: '#FFFFFF',
    },
    checkmark: {
        fontSize: 18,
        color: '#4CAF50',
        width: 16,
    },
    checkmarkDark: {
        color: '#69F0AE',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 0,
    },
    containerDark: {
        backgroundColor: '#000000',
    },
    defaultView: {
        marginVertical: 0,
    },
    loadingContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    placeholderTextDark: {
        color: '#666',
    },
    imageContainer: {
        width: '100%',
        margin: 0,
        padding: 0,
        backgroundColor: 'transparent',
    },
    image: {
        width: '100%',
        resizeMode: 'contain',
        margin: 0,
        padding: 0,
    },
    placeholderText: {
        marginTop: 0,
        marginBottom: 0,
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default HTMLRenderer;
//==============================
// import React, { useState } from 'react';
// import {
//     StyleSheet,
//     useWindowDimensions,
//     Image,
//     View,
//     Text,
//     ActivityIndicator,
//     TouchableOpacity,
//     Platform,
//     useColorScheme,
// } from 'react-native';
// import RenderHTML, {
//     defaultSystemFonts,
//     TNode,
// } from 'react-native-render-html';
// import HTMLImage from './HTMLImage';

// const placeholderImage = require('../assets/placeholder.png');

// interface HTMLRendererProps {
//     htmlContent: string;
// }

// const HTMLRenderer: React.FC<HTMLRendererProps> = ({ htmlContent }) => {
//     const { width } = useWindowDimensions();
//     const [isImageViewerVisible, setImageViewerVisible] = useState(false);
//     const [currentImage, setCurrentImage] = useState<string | null>(null);

//     const theme = useColorScheme();
//     const isDarkMode = theme === 'dark';

//     const customFonts = [
//         'Times New Roman',
//         'Calibri',
//         Platform.OS === 'ios' ? 'System' : 'Noto Sans',
//         'Arial Unicode MS'
//     ];

//     // Enhanced content processing
//     const processedContent = htmlContent
//         // Remove problematic inline styles
//         .replace(/background-color:\s*[^;'"]+/gi, '')
//         .replace(/style="[^"]*background-color:\s*[^;'"]+[^"]*"/gi, '')
//         // Existing character replacements
//         .replace(/<span style="font-family: Wingdings;">[^<]*ü[^<]*<\/span>/g, '✓')
//         .replaceAll('ü', '✓')
//         .replaceAll('Ø', '➡️')
//         .replace(/&Oslash;/g, 'Ø')
//         .replace(/&#252;/g, '✓')
//         .replace(/&#216;/g, 'Ø')
//         .replace(/&nbsp;/g, ' ')
//         .replace(/<br><br>/g, '</p><p>')
//         .replace(/class="MsoListParagraph[^"]*"/g, '')
//         .replace(/style="[^"]*text-indent:[^"]*"/g, '')
//         .replace(/style="[^"]*margin:[^"]*"/g, '')
//         .replace(/<span style="font-family: Symbol;"><span>·[^<]*<\/span><\/span>/g, '•')
//         .replace(/<span style="font: 9px[^>]*>[^<]*<\/span>/g, '')
//         .replace(/\s+/g, ' ')
//         .trim();
// // Updated ListItemRenderer for react-native-render-html v6.3.4
// const ListItemRenderer = ({ TDefaultRenderer, ...props }) => {
//     // Check if we can safely access the content
//     const textContent = props.tnode.children?.[0]?.data || '';
//     const isCheckmark = textContent.includes('✓');
    
//     return (
//       <View style={styles.listItemContainer}>
//         {isCheckmark ? (
//           <Text style={[styles.checkmark, isDarkMode && styles.checkmarkDark]}>✓</Text>
//         ) : (
//           <Text style={[styles.bullet, isDarkMode && styles.bulletDark]}>•</Text>
//         )}
//         <View style={styles.listItemContent}>
//           <TDefaultRenderer {...props} />
//         </View>
//       </View>
//     );
//   };

//     const handleImagePress = (imageUri: string) => {
//         console.log("clicked-image", imageUri);
//         setCurrentImage(imageUri);
//         setImageViewerVisible(true);
//     };

//     const ImageRenderer = (props) => {
//         const { tnode } = props;
//         const [imageError, setImageError] = useState(false);
//         const [loading, setLoading] = useState(true);
//         const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
      
//         const src = tnode.attributes.src || '';
//         const encodedSrc = encodeURI(src);
//         const source = { uri: encodedSrc };
      
//         // Determine aspect ratio from HTML attributes or loaded image
//         const aspectRatio = tnode.attributes.width && tnode.attributes.height
//           ? parseInt(tnode.attributes.width) / parseInt(tnode.attributes.height)
//           : imageSize.width && imageSize.height
//             ? imageSize.width / imageSize.height
//             : 1;
      
//         return (
//           <TouchableOpacity
//             style={{
//               width: '100%',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backgroundColor: 'transparent',
//             }}
//             onPress={() => handleImagePress(encodedSrc)}
//           >
//                 {loading && (
//                     <View style={{ 
//                         position: 'absolute', 
//                         zIndex: 1, 
//                         alignItems: 'center', 
//                         justifyContent: 'center' 
//                     }}>
//                         <ActivityIndicator 
//                             size="large" 
//                             color={isDarkMode ? '#66b3ff' : '#0066cc'} 
//                         />
//                     </View>
//                 )}
//                 <Image
//                     source={imageError ? placeholderImage : source}
//                     style={{
//                         width: '100%',
//                         aspectRatio: aspectRatio,
//                         resizeMode: 'contain',
//                     }}
//                     onLoadEnd={() => setLoading(false)}
//                     onError={(error) => {
//                         console.error('Image Load Error:', error.nativeEvent);
//                         setImageError(true);
//                     }}
//                     onLoad={(event) => {
//                         const { width, height } = event.nativeEvent.source;
//                         setImageSize({ width, height });
//                     }}
//                 />
//                 {imageError && (
//                     <Text style={{
//                         color: isDarkMode ? '#666' : '#999',
//                         fontSize: 14,
//                         textAlign: 'center',
//                     }}>
//                         Image not available
//                     </Text>
//                 )}
//             </TouchableOpacity>
//         );
//     };

//     // Theme-specific styles
//     const themeStyles = isDarkMode ? {
//         body: { 
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         p: { 
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         a: { 
//             color: '#66b3ff', 
//             backgroundColor: 'transparent'
//         },
//         h1: { 
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         h2: { 
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         span: {
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         div: {
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         }
//     } : {
//         body: { color: '#333333' },
//         p: { color: '#333333' },
//         a: { color: '#0066cc' },
//         h1: { color: '#333333' },
//         h2: { color: '#333333' },
//         span: { color: '#333333' },
//         div: { color: '#333333' }
//     };

//     const renderers = {
//         img: ImageRenderer,
//         li: ListItemRenderer
//     };

//     const renderConfig = {
//         renderers,
//         //agsStyles: themeStyles,
//         systemFonts: [...defaultSystemFonts, ...customFonts],
//         baseStyle: {
//             color: isDarkMode ? '#FFFFFF' : '#333333',
//             backgroundColor: 'transparent'
//         },
//         defaultTextProps: {
//             style: {
//                 color: isDarkMode ? '#FFFFFF' : '#333333',
//                 backgroundColor: 'transparent',
//             }
//         },
//         tagsStyles: {
//             ...themeStyles,
//             img: {
//                 margin: 0,
//                 padding: 0,
//                 backgroundColor: 'transparent',
//             }
//         },
//         contentStyle: {
//             margin: 0,
//             padding: 0,
//             backgroundColor: 'transparent',
//         }
//     };

//     return (
//         <View style={[styles.container, isDarkMode && styles.containerDark]}>
//             <RenderHTML
//                 contentWidth={width}
//                 source={{ html: processedContent }}
//                 renderers={renderers}
//                 {...renderConfig}
//             />
//             {currentImage && (
//                 <HTMLImage
//                     isVisible={isImageViewerVisible}
//                     imageUri={currentImage}
//                     onClose={() => setImageViewerVisible(false)}
//                 />
//             )}
//         </View>
//     );
// };


// const styles = StyleSheet.create({
//     listItemContainer: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         marginVertical: 8,
//         paddingLeft: 16,
//         paddingRight: 16,
//     },
//     listItemContent: {
//         flex: 1,
//         marginLeft: 8,
//     },
//     bullet: {
//         fontSize: 16,
//         color: '#333333',
//         marginTop: Platform.OS === 'ios' ? 2 : 0,
//         width: 16,
//     },
//     bulletDark: {
//         color: '#FFFFFF',
//     },
//     checkmark: {
//         fontSize: 18,
//         color: '#4CAF50',
//         width: 16,
//     },
//     checkmarkDark: {
//         color: '#69F0AE',
//     },
//     container: {
//         flex: 1,
//         backgroundColor: '#FFFFFF',
//         padding: 0,
//     },
//     containerDark: {
//         backgroundColor: '#000000',
//     },
//     defaultView: {
//         marginVertical: 0,
//     },
 
//     loadingContainer: {
//         position: 'absolute',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 1,
//     },
    
   
//     placeholderTextDark: {
//         color: '#666',
//     },
//     imageContainer: {
//         width: '100%',
//         margin: 0,
//         padding: 0,
//         backgroundColor: 'transparent',
//     },
//     image: {
//         width: '100%',
//         resizeMode: 'contain',
//         margin: 0,
//         padding: 0,
//     },
//     placeholderText: {
//         marginTop: 0,
//         marginBottom: 0,
//         color: '#999',
//         fontSize: 14,
//         textAlign: 'center',
//     },
    
// });

// export default HTMLRenderer;
//====================================================================================
// import React, { useState } from 'react';
// import {
//     StyleSheet,
//     useWindowDimensions,
//     Image,
//     View,
//     Text,
//     ActivityIndicator,
//     TouchableOpacity,
//     Platform,
//     useColorScheme,
// } from 'react-native';
// import RenderHTML, {
//     defaultSystemFonts,
//     TNode,
// } from 'react-native-render-html';
// import HTMLImage from './HTMLImage';

// const placeholderImage = require('../assets/placeholder.png');

// interface HTMLRendererProps {
//     htmlContent: string;
// }

// const HTMLRenderer: React.FC<HTMLRendererProps> = ({ htmlContent }) => {
//     const { width } = useWindowDimensions();
//     const [isImageViewerVisible, setImageViewerVisible] = useState(false);
//     const [currentImage, setCurrentImage] = useState<string | null>(null);

//     const theme = useColorScheme();
//     const isDarkMode = theme === 'dark';

//     const customFonts = [
//         'Times New Roman',
//         'Calibri',
//         Platform.OS === 'ios' ? 'System' : 'Noto Sans',
//         'Arial Unicode MS'
//     ];

//     // Enhanced content processing
//     const processedContent = htmlContent
//         // Remove problematic inline styles
//         .replace(/background-color:\s*[^;'"]+/gi, '')
//         .replace(/style="[^"]*background-color:\s*[^;'"]+[^"]*"/gi, '')
//         // Existing character replacements
//         .replace(/<span style="font-family: Wingdings;">[^<]*ü[^<]*<\/span>/g, '✓')
//         .replaceAll('ü', '✓')
//         .replaceAll('Ø', '➡️')
//         .replace(/&Oslash;/g, 'Ø')
//         .replace(/&#252;/g, '✓')
//         .replace(/&#216;/g, 'Ø')
//         .replace(/&nbsp;/g, ' ')
//         .replace(/<br><br>/g, '</p><p>')
//         .replace(/class="MsoListParagraph[^"]*"/g, '')
//         .replace(/style="[^"]*text-indent:[^"]*"/g, '')
//         .replace(/style="[^"]*margin:[^"]*"/g, '')
//         .replace(/<span style="font-family: Symbol;"><span>·[^<]*<\/span><\/span>/g, '•')
//         .replace(/<span style="font: 9px[^>]*>[^<]*<\/span>/g, '')
//         .replace(/\s+/g, ' ')
//         .trim();

//     const ListItemRenderer = ({ TDefaultRenderer, ...props }) => {
//         const isCheckmark = props.tnode.data?.includes('✓');
//         const content = isCheckmark ?
//             props.tnode.data.replace('✓', '').trim() :
//             props.tnode.data;

//         return (
//             <View style={styles.listItemContainer}>
//                 {isCheckmark ? (
//                     <Text style={[styles.checkmark, isDarkMode && styles.checkmarkDark]}>✓</Text>
//                 ) : (
//                     <Text style={[styles.bullet, isDarkMode && styles.bulletDark]}>•</Text>
//                 )}
//                 <View style={styles.listItemContent}>
//                     <TDefaultRenderer
//                         {...props}
//                         tnode={{
//                             ...props.tnode,
//                             data: content
//                         }}
//                         style={[
//                             props.style,
//                             { color: isDarkMode ? '#FFFFFF' : '#333333' }
//                         ]}
//                     />
//                 </View>
//             </View>
//         );
//     };

//     const handleImagePress = (imageUri: string) => {
//         console.log("clicked-image", imageUri);
//         setCurrentImage(imageUri);
//         setImageViewerVisible(true);
//     };

//     const ImageRenderer: React.FC<{ tnode: TNode }> = ({ tnode }) => {
//         const [imageError, setImageError] = useState(false);
//         const [loading, setLoading] = useState(true);
//         const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    
//         const encodedSrc = encodeURI(tnode.attributes.src);
//         const source = { uri: encodedSrc };
    
//         // Determine aspect ratio from HTML attributes or loaded image
//         const aspectRatio = tnode.attributes.width && tnode.attributes.height
//             ? parseInt(tnode.attributes.width as string) / parseInt(tnode.attributes.height as string)
//             : imageSize.width && imageSize.height
//                 ? imageSize.width / imageSize.height
//                 : 1;
    
//         return (
//             <TouchableOpacity
//                 style={{
//                     width: '100%',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     backgroundColor: 'transparent',
//                 }}
//                 onPress={() => handleImagePress(encodedSrc)}
//             >
//                 {loading && (
//                     <View style={{ 
//                         position: 'absolute', 
//                         zIndex: 1, 
//                         alignItems: 'center', 
//                         justifyContent: 'center' 
//                     }}>
//                         <ActivityIndicator 
//                             size="large" 
//                             color={isDarkMode ? '#66b3ff' : '#0066cc'} 
//                         />
//                     </View>
//                 )}
//                 <Image
//                     source={imageError ? placeholderImage : source}
//                     style={{
//                         width: '100%',
//                         aspectRatio: aspectRatio,
//                         resizeMode: 'contain',
//                     }}
//                     onLoadEnd={() => setLoading(false)}
//                     onError={(error) => {
//                         console.error('Image Load Error:', error.nativeEvent);
//                         setImageError(true);
//                     }}
//                     onLoad={(event) => {
//                         const { width, height } = event.nativeEvent.source;
//                         setImageSize({ width, height });
//                     }}
//                 />
//                 {imageError && (
//                     <Text style={{
//                         color: isDarkMode ? '#666' : '#999',
//                         fontSize: 14,
//                         textAlign: 'center',
//                     }}>
//                         Image not available
//                     </Text>
//                 )}
//             </TouchableOpacity>
//         );
//     };

//     // Theme-specific styles
//     const themeStyles = isDarkMode ? {
//         body: { 
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         p: { 
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         a: { 
//             color: '#66b3ff', 
//             backgroundColor: 'transparent'
//         },
//         h1: { 
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         h2: { 
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         span: {
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         },
//         div: {
//             color: '#FFFFFF',
//             backgroundColor: 'transparent'
//         }
//     } : {
//         body: { color: '#333333' },
//         p: { color: '#333333' },
//         a: { color: '#0066cc' },
//         h1: { color: '#333333' },
//         h2: { color: '#333333' },
//         span: { color: '#333333' },
//         div: { color: '#333333' }
//     };

//     const renderers = {
//         img: ImageRenderer,
//         li: ListItemRenderer
//     };

//     const renderConfig = {
//         renderers,
//         //agsStyles: themeStyles,
//         systemFonts: [...defaultSystemFonts, ...customFonts],
//         baseStyle: {
//             color: isDarkMode ? '#FFFFFF' : '#333333',
//             backgroundColor: 'transparent'
//         },
//         defaultTextProps: {
//             style: {
//                 color: isDarkMode ? '#FFFFFF' : '#333333',
//                 backgroundColor: 'transparent',
//             }
//         },
//         tagsStyles: {
//             ...themeStyles,
//             img: {
//                 margin: 0,
//                 padding: 0,
//                 backgroundColor: 'transparent',
//             }
//         },
//         contentStyle: {
//             margin: 0,
//             padding: 0,
//             backgroundColor: 'transparent',
//         }
//     };

//     return (
//         <View style={[styles.container, isDarkMode && styles.containerDark]}>
//             <RenderHTML
//                 contentWidth={width}
//                 source={{ html: processedContent }}
//                 renderers={renderers}
//                 {...renderConfig}
//             />
//             {currentImage && (
//                 <HTMLImage
//                     isVisible={isImageViewerVisible}
//                     imageUri={currentImage}
//                     onClose={() => setImageViewerVisible(false)}
//                 />
//             )}
//         </View>
//     );
// };


// const styles = StyleSheet.create({
//     listItemContainer: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         marginVertical: 8,
//         paddingLeft: 16,
//         paddingRight: 16,
//     },
//     listItemContent: {
//         flex: 1,
//         marginLeft: 8,
//     },
//     bullet: {
//         fontSize: 16,
//         color: '#333333',
//         marginTop: Platform.OS === 'ios' ? 2 : 0,
//         width: 16,
//     },
//     bulletDark: {
//         color: '#FFFFFF',
//     },
//     checkmark: {
//         fontSize: 18,
//         color: '#4CAF50',
//         width: 16,
//     },
//     checkmarkDark: {
//         color: '#69F0AE',
//     },
//     container: {
//         flex: 1,
//         backgroundColor: '#FFFFFF',
//         padding: 0,
//     },
//     containerDark: {
//         backgroundColor: '#000000',
//     },
//     defaultView: {
//         marginVertical: 0,
//     },
 
//     loadingContainer: {
//         position: 'absolute',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 1,
//     },
    
   
//     placeholderTextDark: {
//         color: '#666',
//     },
//     imageContainer: {
//         width: '100%',
//         margin: 0,
//         padding: 0,
//         backgroundColor: 'transparent',
//     },
//     image: {
//         width: '100%',
//         resizeMode: 'contain',
//         margin: 0,
//         padding: 0,
//     },
//     placeholderText: {
//         marginTop: 0,
//         marginBottom: 0,
//         color: '#999',
//         fontSize: 14,
//         textAlign: 'center',
//     },
    
// });

// export default HTMLRenderer;
