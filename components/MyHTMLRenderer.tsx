// import React from 'react';
// import { Modal, StyleSheet, View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
// import WebView from 'react-native-webview';

// interface MyHTMLRendererProps {

//   htmlContent: string;
// }

// const MyHTMLRenderer: React.FC<MyHTMLRendererProps> = ({
 
//   htmlContent,
// }) => {
//   // Create a complete HTML document with proper styling
//   const wrappedHtmlContent = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
//         <style>
//           body {
//             margin: 16px;
//             font-family: -apple-system, system-ui;
//             color: #333;
//             line-height: 1.5;
//           }
//           img {
//             max-width: 100%;
//             height: auto;
//           }
//         </style>
//       </head>
//       <body>
//         ${htmlContent}
//       </body>
//     </html>
//   `;

//   return (
//     <Modal
//       animationType="slide"
//       transparent={false}
      
   
//     >
//       <SafeAreaView style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <Text style={styles.closeButtonText}>Close</Text>
//           </TouchableOpacity>
//         </View>
//         <WebView
//           source={{ html: wrappedHtmlContent }}
//           style={styles.webview}
//           scrollEnabled={true}
//           showsVerticalScrollIndicator={true}
//           originWhitelist={['*']}
//           // Enable JavaScript for any interactive elements
//           javaScriptEnabled={true}
//           // Prevent content from overflowing
//           scalesPageToFit={false}
//         />
//       </SafeAreaView>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
//   header: {
//     height: 50,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     justifyContent: 'center',
//     paddingHorizontal: 10,
//   },
//   closeButton: {
//     position: 'absolute',
//     right: 16,
//     top: 12,
//   },
//   closeButtonText: {
//     fontSize: 16,
//     color: '#007AFF',
//   },
//   webview: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
// });

// export default MyHTMLRenderer;